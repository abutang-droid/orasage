'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaithPicker } from '@/components/FaithPicker';
import { WorldMapSvg, type MapHotspot } from '@/components/geo/WorldMapSvg';
import {
  countryMapCoords,
  fitViewportToHotspots,
  spreadMapCoords,
  WORLD_VIEWPORT,
} from '@/lib/geo/map-layout';
import type { GeoCountry, GeoJourneySelection, GeoRegion } from '@/lib/geo/types';
import { storeGeo } from '@/lib/geo/types';
import {
  getFaithById,
  SPECIAL_FAITH_IDS,
  type FaithOption,
} from '@/lib/faiths/religions';
import { splitFaithsByRank } from '@/lib/cms/faiths';
import './geo-journey.css';

type JourneyStep = 'region' | 'country' | 'faith';

type GeoJourneyPickerProps = {
  value?: Partial<GeoJourneySelection>;
  onComplete: (result: GeoJourneySelection) => void;
  title?: string;
  subtitle?: string;
  faithConfirmLabel?: string;
  fullscreen?: boolean;
};

type SuggestResponse = {
  suggestedCode: string | null;
  country: GeoCountry | null;
  source: string;
};

type FaithApiResponse = {
  faiths?: FaithOption[];
};

const STEP_LABELS = ['大洲', '国家', '信仰'];

const CONFIRM_LABELS: Record<JourneyStep, string> = {
  region: '确认大洲，选择国家',
  country: '确认国家，选择信仰',
  faith: '下一步 · 选择圣地',
};

export function GeoJourneyPicker({
  value,
  onComplete,
  title = '第一步 · 你的心灵故乡',
  subtitle = '从世界地图出发，找到与你最贴近的国家与信仰',
  faithConfirmLabel = '下一步 · 选择圣地',
  fullscreen = true,
}: GeoJourneyPickerProps) {
  const [step, setStep] = useState<JourneyStep>('region');
  const [regions, setRegions] = useState<GeoRegion[]>([]);
  const [countries, setCountries] = useState<GeoCountry[]>([]);
  const [faiths, setFaiths] = useState<FaithOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [faithsLoading, setFaithsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [continentCode, setContinentCode] = useState(value?.continentCode ?? '');
  const [countryCode, setCountryCode] = useState(value?.countryCode ?? '');
  const [pendingRegion, setPendingRegion] = useState<string | null>(null);
  const [pendingCountry, setPendingCountry] = useState<string | null>(null);
  const [pendingFaith, setPendingFaith] = useState<string | null>(value?.faith ?? null);
  const [suggested, setSuggested] = useState<SuggestResponse | null>(null);

  const confirmLabel =
    step === 'faith' ? faithConfirmLabel : CONFIRM_LABELS[step];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch('/api/geo/regions').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/geo/suggest-country').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([regionsData, suggestData]) => {
        if (cancelled) return;
        if (regionsData?.regions) setRegions(regionsData.regions);
        if (suggestData) setSuggested(suggestData as SuggestResponse);

        if (value?.continentCode && value?.countryCode) {
          setContinentCode(value.continentCode);
          setCountryCode(value.countryCode);
          setStep(value.faith ? 'faith' : 'country');
        } else if (suggestData?.country?.regionCode) {
          setPendingRegion(suggestData.country.regionCode);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [value?.continentCode, value?.countryCode, value?.faith]);

  const loadCountries = useCallback(async (region: string) => {
    setCountriesLoading(true);
    try {
      const res = await fetch(`/api/geo/countries?region=${encodeURIComponent(region)}`);
      const data = res.ok ? await res.json() : null;
      setCountries(data?.countries ?? []);
    } catch {
      setCountries([]);
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  const loadFaiths = useCallback(async (code: string) => {
    setFaithsLoading(true);
    try {
      const res = await fetch(`/api/faiths?country=${encodeURIComponent(code)}`);
      const data: FaithApiResponse | null = res.ok ? await res.json() : null;
      setFaiths(data?.faiths?.length ? data.faiths : []);
    } catch {
      setFaiths([]);
    } finally {
      setFaithsLoading(false);
    }
  }, []);

  const pickRegion = useCallback((code: string) => {
    setPendingRegion(code);
    setListOpen(false);
  }, []);

  const pickCountry = useCallback((code: string) => {
    setPendingCountry(code);
    setListOpen(false);
  }, []);

  const pickFaith = useCallback((faithId: string) => {
    setPendingFaith(faithId);
    setListOpen(false);
  }, []);

  const confirmRegion = useCallback(() => {
    if (!pendingRegion) return;
    setContinentCode(pendingRegion);
    setCountryCode('');
    setPendingCountry(null);
    setPendingFaith(null);
    setPendingRegion(null);
    setSearch('');
    setStep('country');
    void loadCountries(pendingRegion);
  }, [pendingRegion, loadCountries]);

  const confirmCountry = useCallback(() => {
    if (!pendingCountry || !continentCode) return;
    setCountryCode(pendingCountry);
    storeGeo(continentCode, pendingCountry);
    setPendingFaith(null);
    setPendingCountry(null);
    setStep('faith');
  }, [pendingCountry, continentCode]);

  const confirmFaith = useCallback(
    (faithId: string) => {
      if (!continentCode || !countryCode) return;
      storeGeo(continentCode, countryCode);
      onComplete({ continentCode, countryCode, faith: faithId });
    },
    [continentCode, countryCode, onComplete],
  );

  const confirmCurrentStep = useCallback(() => {
    if (step === 'region') {
      confirmRegion();
      return;
    }
    if (step === 'country') {
      confirmCountry();
      return;
    }
    if (step === 'faith' && pendingFaith) {
      confirmFaith(pendingFaith);
    }
  }, [step, confirmRegion, confirmCountry, confirmFaith, pendingFaith]);

  useEffect(() => {
    if (step === 'country' && continentCode && countries.length === 0 && !countriesLoading) {
      void loadCountries(continentCode);
    }
  }, [step, continentCode, countries.length, countriesLoading, loadCountries]);

  useEffect(() => {
    if (step === 'faith' && countryCode) {
      void loadFaiths(countryCode);
    }
  }, [step, countryCode, loadFaiths]);

  const regionName = useMemo(
    () => regions.find((r) => r.code === continentCode)?.nameZh ?? '',
    [regions, continentCode],
  );

  const countryName = useMemo(
    () => countries.find((c) => c.code === countryCode)?.nameZh ?? suggested?.country?.nameZh ?? '',
    [countries, countryCode, suggested?.country?.nameZh],
  );

  const selectedCountry = useMemo(
    () => countries.find((c) => c.code === countryCode) ?? suggested?.country ?? null,
    [countries, countryCode, suggested?.country],
  );

  const pendingRegionOption = useMemo(
    () => regions.find((r) => r.code === pendingRegion) ?? null,
    [regions, pendingRegion],
  );

  const pendingCountryOption = useMemo(
    () => countries.find((c) => c.code === pendingCountry) ?? null,
    [countries, pendingCountry],
  );

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.nameZh.includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [countries, search]);

  const mapFaiths = useMemo(() => {
    if (faiths.length === 0) return [];
    const split = splitFaithsByRank(faiths);
    const ranked = [...split.top, ...split.more].filter((f) => !SPECIAL_FAITH_IDS.has(f.id));
    return ranked.slice(0, 6);
  }, [faiths]);

  const regionHotspots: MapHotspot[] = useMemo(
    () =>
      regions.map((r) => ({
        id: r.code,
        label: r.nameZh,
        sublabel: r.nameEn,
        mapX: r.mapX,
        mapY: r.mapY,
      })),
    [regions],
  );

  const countryHotspots: MapHotspot[] = useMemo(
    () =>
      countries.map((c) => {
        const coords = countryMapCoords(c.code, c);
        return {
          id: c.code,
          label: c.nameZh,
          sublabel: c.nameEn,
          mapX: coords.mapX,
          mapY: coords.mapY,
        };
      }),
    [countries],
  );

  const faithHotspots: MapHotspot[] = useMemo(() => {
    if (!selectedCountry) return [];
    const base = countryMapCoords(selectedCountry.code, selectedCountry);
    return mapFaiths.map((faith, index) => {
      const pos = spreadMapCoords(base.mapX, base.mapY, index, mapFaiths.length);
      return {
        id: faith.id,
        label: faith.nameZh,
        sublabel: faith.nameEn,
        emoji: faith.emoji,
        mapX: pos.mapX,
        mapY: pos.mapY,
      };
    });
  }, [mapFaiths, selectedCountry]);

  const activeHotspots =
    step === 'region' ? regionHotspots : step === 'country' ? countryHotspots : faithHotspots;

  const viewport = useMemo(() => {
    if (step === 'region') return fitViewportToHotspots(regionHotspots);
    if (step === 'country') return fitViewportToHotspots(countryHotspots);
    if (step === 'faith') return fitViewportToHotspots(faithHotspots);
    return WORLD_VIEWPORT;
  }, [step, regionHotspots, countryHotspots, faithHotspots]);

  const viewportKey = `${step}-${continentCode}-${countryCode}-${activeHotspots.length}`;

  const selectedMapId =
    step === 'region'
      ? (pendingRegion ?? continentCode) || null
      : step === 'country'
        ? (pendingCountry ?? countryCode) || null
        : pendingFaith;

  const handleMapSelect = useCallback(
    (id: string) => {
      if (step === 'region') {
        pickRegion(id);
        return;
      }
      if (step === 'country') {
        pickCountry(id);
        return;
      }
      pickFaith(id);
    },
    [step, pickRegion, pickCountry, pickFaith],
  );

  const showSuggestBanner =
    step === 'country' &&
    suggested?.country &&
    suggested.country.regionCode === continentCode &&
    !countryCode &&
    !pendingCountry;

  const stepIndex = step === 'region' ? 0 : step === 'country' ? 1 : 2;

  const goBack = () => {
    setListOpen(false);
    if (step === 'faith') {
      setPendingFaith(null);
      setStep('country');
      return;
    }
    if (step === 'country') {
      setPendingCountry(null);
      setStep('region');
      setCountryCode('');
      setSearch('');
    }
  };

  const stepTitle =
    step === 'region'
      ? title
      : step === 'country'
        ? `选择国家 · ${regionName}`
        : `选择信仰 · ${countryName}`;

  const stepHint =
    step === 'region'
      ? '点选地图上的大洲，确认后继续；可拖动平移、双指缩放'
      : step === 'country'
        ? '点选国家后点击确认；或打开列表搜索'
        : '点选信仰后点击确认；或打开列表查看更多';

  const listButtonLabel =
    step === 'region' ? '列表选大洲' : step === 'country' ? '列表选国家' : '列表选信仰';

  const pendingFaithOption = pendingFaith
    ? getFaithById(pendingFaith, faiths) ?? mapFaiths.find((f) => f.id === pendingFaith) ?? null
    : null;

  const pendingConfirm =
    step === 'region'
      ? pendingRegionOption
        ? { emoji: '🌍', name: pendingRegionOption.nameZh, sub: pendingRegionOption.nameEn }
        : null
      : step === 'country'
        ? pendingCountryOption
          ? { emoji: '📍', name: pendingCountryOption.nameZh, sub: pendingCountryOption.nameEn }
          : null
        : pendingFaithOption
          ? { emoji: pendingFaithOption.emoji, name: pendingFaithOption.nameZh, sub: pendingFaithOption.nameEn }
          : null;

  if (loading) {
    return (
      <div className={`geo-journey${fullscreen ? ' geo-journey--fullscreen' : ''}`}>
        <div className="geo-journey-loading">正在加载世界地图…</div>
      </div>
    );
  }

  return (
    <div className={`geo-journey${fullscreen ? ' geo-journey--fullscreen' : ''}`}>
      <div className="geo-journey-map-layer">
        <WorldMapSvg
          hotspots={activeHotspots}
          selectedId={selectedMapId}
          onSelect={handleMapSelect}
          viewport={viewport}
          viewportKey={viewportKey}
          ariaLabel={
            step === 'region'
              ? '世界地图，点选大洲'
              : step === 'country'
                ? '区域地图，点选国家'
                : '国家地图，点选信仰'
          }
          compactLabels={step === 'faith'}
        />
      </div>

      <div className="geo-journey-overlay">
        <header className="geo-journey-header">
          {step !== 'region' ? (
            <button type="button" className="geo-journey-back" onClick={goBack}>
              ← 返回
            </button>
          ) : (
            <span className="geo-journey-back-spacer" />
          )}

          <div className="geo-journey-steps" aria-label="进度">
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                className={`geo-journey-step-pill${i < stepIndex ? ' is-done' : ''}${i === stepIndex ? ' is-current' : ''}`}
              >
                <span className="geo-journey-step-dot" />
                <span className="geo-journey-step-label">{label}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="geo-journey-copy">
          {step === 'region' && subtitle ? <p className="geo-journey-subtitle">{subtitle}</p> : null}
          <h1 className="geo-journey-title">{stepTitle}</h1>
          <p className="geo-journey-hint">{stepHint}</p>
        </div>

        {showSuggestBanner && suggested?.country && (
          <button
            type="button"
            className="geo-journey-suggest"
            onClick={() => pickCountry(suggested.country!.code)}
          >
            <span aria-hidden>📍</span>
            <span>
              <span className="geo-journey-suggest-lead">根据位置推荐</span>
              <span className="geo-journey-suggest-name">{suggested.country.nameZh}</span>
            </span>
          </button>
        )}

        {pendingConfirm && (
          <div className="geo-journey-faith-confirm">
            <div className="geo-journey-faith-confirm-card">
              <span className="geo-journey-faith-confirm-emoji">{pendingConfirm.emoji}</span>
              <div>
                <div className="geo-journey-faith-confirm-name">{pendingConfirm.name}</div>
                <div className="geo-journey-faith-confirm-en">{pendingConfirm.sub}</div>
              </div>
            </div>
            <button
              type="button"
              className="btn-primary geo-journey-faith-confirm-btn"
              onClick={confirmCurrentStep}
            >
              {confirmLabel}
            </button>
          </div>
        )}

        <footer className="geo-journey-footer">
          <button
            type="button"
            className="btn-outline geo-journey-list-btn"
            onClick={() => setListOpen(true)}
          >
            {listButtonLabel}
          </button>
        </footer>
      </div>

      {listOpen && (
        <div className="geo-journey-drawer" role="dialog" aria-modal="true">
          <button
            type="button"
            className="geo-journey-drawer-backdrop"
            aria-label="关闭列表"
            onClick={() => setListOpen(false)}
          />
          <div className="geo-journey-drawer-panel">
            <div className="geo-journey-drawer-handle" aria-hidden />
            <div className="geo-journey-drawer-header">
              <h2>{listButtonLabel}</h2>
              <button type="button" className="geo-journey-drawer-close" onClick={() => setListOpen(false)}>
                关闭
              </button>
            </div>

            {step === 'region' && (
              <div className="geo-country-list">
                {regions.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    className={`geo-country-item${(pendingRegion ?? continentCode) === r.code ? ' is-selected' : ''}`}
                    onClick={() => pickRegion(r.code)}
                  >
                    <span>
                      <span className="geo-country-item-name">{r.nameZh}</span>
                      <span className="geo-country-item-en">{r.nameEn}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === 'country' && (
              <>
                <div className="geo-country-search">
                  <input
                    className="input-field"
                    placeholder="🔍 搜索国家或地区…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {countriesLoading ? (
                  <div className="geo-journey-loading">正在加载国家列表…</div>
                ) : (
                  <div className="geo-country-list">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        className={`geo-country-item${(pendingCountry ?? countryCode) === c.code ? ' is-selected' : ''}`}
                        onClick={() => pickCountry(c.code)}
                      >
                        <span>
                          <span className="geo-country-item-name">{c.nameZh}</span>
                          <span className="geo-country-item-en">{c.nameEn}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 'faith' && countryCode && (
              <div className="geo-journey-drawer-faith">
                <FaithPicker
                  value={pendingFaith ?? value?.faith}
                  countryCode={countryCode}
                  onChange={(faithId) => {
                    setListOpen(false);
                    confirmFaith(faithId);
                  }}
                  title=""
                  subtitle=""
                  confirmLabel={faithConfirmLabel}
                />
                {faithsLoading ? (
                  <div className="geo-journey-loading">正在加载信仰列表…</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
