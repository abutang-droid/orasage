'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaithPicker } from '@/components/FaithPicker';
import type { GeoDetectSource } from '@/lib/geo/detect-country';
import { useCountrySuggestion, type CountrySuggestion } from '@/lib/geo/use-country-suggestion';
import type { GeoCountry, GeoJourneySelection, GeoRegion } from '@/lib/geo/types';
import { storeGeo } from '@/lib/geo/types';
import {
  getMoreFaiths,
  getTopFaiths,
  formatFaithLabel,
  type FaithOption,
} from '@/lib/faiths/religions';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
import './geo-journey.css';

const JourneyVectorMap = dynamic(
  () => import('@/components/geo/JourneyVectorMap').then((m) => m.JourneyVectorMap),
  {
    ssr: false,
    loading: () => <div className="geo-journey-loading">正在加载世界地图…</div>,
  },
);

type JourneyStep = 'region' | 'country' | 'faith' | 'deity';

type GeoJourneyPickerProps = {
  value?: Partial<GeoJourneySelection>;
  onComplete: (result: GeoJourneySelection) => void;
  title?: string;
  subtitle?: string;
  faithConfirmLabel?: string;
  deityConfirmLabel?: string;
  /** 信仰选完后继续选守护神（祈福页）；引导流程可关闭 */
  pickDeity?: boolean;
  fullscreen?: boolean;
};

type FaithApiResponse = {
  faiths?: FaithOption[];
  regional?: boolean;
};

const LOCATION_SOURCE_LABEL: Record<GeoDetectSource, string> = {
  gps: '定位服务',
  ip: '网络位置',
  manual: '手动选择',
};

const STEP_LABELS_BASE = ['大洲', '国家', '信仰'] as const;
const STEP_LABEL_DEITY = '守护神';

const CONFIRM_LABELS: Record<Exclude<JourneyStep, 'deity'>, string> = {
  region: '确认大洲，选择国家',
  country: '确认国家，选择信仰',
  faith: '下一步 · 选择守护神',
};

export function GeoJourneyPicker({
  value,
  onComplete,
  title = '第一步 · 你的心灵故乡',
  subtitle = '从世界地图出发，找到与你最贴近的国家与信仰',
  faithConfirmLabel = '确认信仰，选择守护神',
  deityConfirmLabel = '确认守护神',
  pickDeity = false,
  fullscreen = true,
}: GeoJourneyPickerProps) {
  const [step, setStep] = useState<JourneyStep>('region');
  const [regions, setRegions] = useState<GeoRegion[]>([]);
  const [allCountries, setAllCountries] = useState<GeoCountry[]>([]);
  const [countries, setCountries] = useState<GeoCountry[]>([]);
  const [faiths, setFaiths] = useState<FaithOption[]>([]);
  const [sanctuaries, setSanctuaries] = useState<Sanctuary[]>([]);
  const [loading, setLoading] = useState(true);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [faithsLoading, setFaithsLoading] = useState(false);
  const [sanctuariesLoading, setSanctuariesLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [continentCode, setContinentCode] = useState(value?.continentCode ?? '');
  const [countryCode, setCountryCode] = useState(value?.countryCode ?? '');
  const [pendingRegion, setPendingRegion] = useState<string | null>(null);
  const [pendingCountry, setPendingCountry] = useState<string | null>(null);
  const [pendingFaith, setPendingFaith] = useState<string | null>(value?.faith ?? null);
  const [pendingDeity, setPendingDeity] = useState<string | null>(value?.deityCode ?? null);
  const [locationSource, setLocationSource] = useState<GeoDetectSource>('manual');
  const [faithRegional, setFaithRegional] = useState(true);
  const [manualListMode, setManualListMode] = useState(false);
  const [detectedSuggestion, setDetectedSuggestion] = useState<CountrySuggestion | null>(null);
  const initDone = useRef(false);

  const { suggestion, resolving: locationResolving, resolved: locationResolved } = useCountrySuggestion(
    allCountries,
    !loading && allCountries.length > 0 && !value?.countryCode,
  );

  const confirmLabel =
    step === 'faith'
      ? faithConfirmLabel
      : step === 'deity'
        ? deityConfirmLabel
        : CONFIRM_LABELS[step as keyof typeof CONFIRM_LABELS];

  const stepLabels = pickDeity ? [...STEP_LABELS_BASE, STEP_LABEL_DEITY] : [...STEP_LABELS_BASE];

  useEffect(() => {
    let cancelled = false;
    if (!initDone.current) setLoading(true);
    Promise.all([
      fetch('/api/geo/regions').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/geo/countries').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([regionsData, allCountriesData]) => {
        if (cancelled) return;
        if (regionsData?.regions) setRegions(regionsData.regions);
        if (allCountriesData?.countries) setAllCountries(allCountriesData.countries);

        if (!initDone.current) {
          if (value?.continentCode && value?.countryCode) {
            setContinentCode(value.continentCode);
            setCountryCode(value.countryCode);
            setStep(value.faith ? 'faith' : 'country');
            setLocationSource('manual');
          }
          initDone.current = true;
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
      if (data?.regional && data.faiths?.length) {
        setFaithRegional(true);
        setFaiths(data.faiths);
        return;
      }

      setFaithRegional(false);
      if (data?.faiths?.length) {
        setFaiths(data.faiths);
        return;
      }

      const allRes = await fetch('/api/faiths');
      const allData: FaithApiResponse | null = allRes.ok ? await allRes.json() : null;
      setFaiths(
        allData?.faiths?.length ? allData.faiths : [...getTopFaiths(), ...getMoreFaiths()],
      );
    } catch {
      setFaithRegional(false);
      setFaiths([...getTopFaiths(), ...getMoreFaiths()]);
    } finally {
      setFaithsLoading(false);
    }
  }, []);

  const loadSanctuaries = useCallback(async (faithId: string) => {
    setSanctuariesLoading(true);
    try {
      const res = await fetch(`/api/sanctuaries?faith=${encodeURIComponent(faithId)}`);
      const data = res.ok ? await res.json() : null;
      setSanctuaries(data?.sanctuaries ?? []);
    } catch {
      setSanctuaries([]);
    } finally {
      setSanctuariesLoading(false);
    }
  }, []);

  const applyDetectedCountry = useCallback(
    (country: GeoCountry, source: GeoDetectSource) => {
      setLocationSource(source);
      setContinentCode(country.regionCode);
      setCountryCode(country.code);
      setPendingRegion(null);
      setPendingCountry(null);
      storeGeo(country.regionCode, country.code);
      setStep('faith');
      void loadCountries(country.regionCode);
      void loadFaiths(country.code);
    },
    [loadCountries, loadFaiths],
  );

  useEffect(() => {
    if (!locationResolved) return;
    if (value?.continentCode && value?.countryCode) return;
    if (countryCode || manualListMode || detectedSuggestion) return;

    if (suggestion) {
      setDetectedSuggestion(suggestion);
      void loadCountries(suggestion.country.regionCode);
      return;
    }

    setManualListMode(true);
  }, [
    locationResolved,
    suggestion,
    countryCode,
    manualListMode,
    detectedSuggestion,
    value?.continentCode,
    value?.countryCode,
    loadCountries,
  ]);

  const pickRegion = useCallback((code: string) => {
    setPendingRegion(code);
    setListOpen(false);
    if (manualListMode) {
      setContinentCode(code);
      setCountryCode('');
      setPendingCountry(null);
      setPendingFaith(null);
      setPendingRegion(null);
      setSearch('');
      setStep('country');
      void loadCountries(code);
    }
  }, [manualListMode, loadCountries]);

  const pickCountry = useCallback((code: string) => {
    setPendingCountry(code);
    setListOpen(false);
    if (manualListMode && continentCode) {
      setLocationSource('manual');
      setCountryCode(code);
      storeGeo(continentCode, code);
      setPendingFaith(null);
      setPendingCountry(null);
      setStep('faith');
      void loadFaiths(code);
    }
  }, [manualListMode, continentCode, loadFaiths]);

  const confirmDetectedCountry = useCallback(() => {
    if (!detectedSuggestion) return;
    applyDetectedCountry(detectedSuggestion.country, detectedSuggestion.source);
    setDetectedSuggestion(null);
  }, [detectedSuggestion, applyDetectedCountry]);

  const rejectDetectedCountry = useCallback(() => {
    setDetectedSuggestion(null);
    setManualListMode(true);
    setContinentCode('');
    setCountryCode('');
    setPendingCountry(null);
    setPendingRegion(null);
    setStep('region');
  }, []);

  const skipToManualSelection = useCallback(() => {
    setDetectedSuggestion(null);
    setManualListMode(true);
    setContinentCode('');
    setCountryCode('');
    setPendingCountry(null);
    setPendingRegion(null);
    setStep('region');
  }, []);

  const confirmJourney = useCallback(
    (faithId: string, deityCode?: string) => {
      if (!continentCode || !countryCode) return;
      storeGeo(continentCode, countryCode);
      onComplete({
        continentCode,
        countryCode,
        faith: faithId,
        ...(deityCode ? { deityCode } : {}),
      });
    },
    [continentCode, countryCode, onComplete],
  );

  const onFaithPicked = useCallback(
    (faithId: string) => {
      setPendingFaith(faithId);
      if (pickDeity) {
        setStep('deity');
        setPendingDeity(null);
        void loadSanctuaries(faithId);
        return;
      }
      confirmJourney(faithId);
    },
    [pickDeity, loadSanctuaries, confirmJourney],
  );

  const onDeityPicked = useCallback(
    (deityCode: string) => {
      if (!pendingFaith) return;
      setPendingDeity(deityCode);
      confirmJourney(pendingFaith, deityCode);
    },
    [pendingFaith, confirmJourney],
  );

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
    void loadFaiths(pendingCountry);
  }, [pendingCountry, continentCode, loadFaiths]);

  const confirmCurrentStep = useCallback(() => {
    if (step === 'region') {
      confirmRegion();
      return;
    }
    if (step === 'country') {
      confirmCountry();
      return;
    }
  }, [step, confirmRegion, confirmCountry]);

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
    () =>
      countries.find((c) => c.code === countryCode)?.nameZh ??
      allCountries.find((c) => c.code === countryCode)?.nameZh ??
      suggestion?.country.nameZh ??
      '',
    [countries, countryCode, allCountries, suggestion?.country.nameZh],
  );

  const showDetectConfirm = Boolean(detectedSuggestion) && !countryCode;

  const mapAmbient =
    showDetectConfirm ||
    (manualListMode && (step === 'region' || step === 'country')) ||
    step === 'faith' ||
    step === 'deity';

  const mapStep =
    showDetectConfirm || step === 'faith' || step === 'deity' ? 'country' : step;
  const mapContinentCode = showDetectConfirm
    ? detectedSuggestion?.country.regionCode
    : continentCode;
  const mapCountryCode = showDetectConfirm ? detectedSuggestion?.country.code : countryCode;
  const mapCountries =
    showDetectConfirm && detectedSuggestion
      ? allCountries.filter((c) => c.regionCode === detectedSuggestion.country.regionCode)
      : countries;

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

  const pendingRegionOption = useMemo(() => {
    if (!pendingRegion) return null;
    return regions.find((r) => r.code === pendingRegion) ?? null;
  }, [regions, pendingRegion]);

  const pendingCountryOption = useMemo(() => {
    if (!pendingCountry) return null;
    return countries.find((c) => c.code === pendingCountry) ?? null;
  }, [countries, pendingCountry]);

  const selectedMapId =
    step === 'region'
      ? (pendingRegion ?? continentCode) || null
      : step === 'country'
        ? (pendingCountry ?? countryCode) || null
        : null;

  const handleMapSelect = useCallback(
    (id: string) => {
      if (step === 'region') {
        pickRegion(id);
        return;
      }
      if (step === 'country') {
        pickCountry(id);
      }
    },
    [step, pickRegion, pickCountry],
  );

  const showLocationBadge =
    step === 'faith' &&
    countryCode &&
    (locationSource === 'gps' || locationSource === 'ip') &&
    !showDetectConfirm;

  const showInlineFaithPicker = step === 'faith' && Boolean(countryCode);
  const showInlineDeityPicker = step === 'deity' && Boolean(pendingFaith);

  const changeCountry = useCallback(() => {
    setLocationSource('manual');
    setPendingFaith(null);
    setStep('country');
    if (continentCode) void loadCountries(continentCode);
  }, [continentCode, loadCountries]);

  const stepIndex =
    step === 'region'
      ? 0
      : step === 'country'
        ? 1
        : step === 'faith'
          ? 2
          : 3;

  const goBack = () => {
    setListOpen(false);
    if (step === 'deity') {
      setPendingDeity(null);
      setStep('faith');
      return;
    }
    if (step === 'faith') {
      setPendingFaith(null);
      setStep('country');
      return;
    }
    if (step === 'country') {
      setPendingCountry(null);
      setContinentCode('');
      setStep('region');
      setCountryCode('');
      setSearch('');
    }
  };

  const stepTitle =
    showDetectConfirm && detectedSuggestion
      ? '确认你的国家'
      : step === 'region'
        ? title
        : step === 'country'
          ? `选择国家 · ${regionName}`
          : step === 'faith'
            ? `选择信仰 · ${countryName}`
            : `选择守护神 · ${formatFaithLabel(pendingFaith, faiths)}`;

  const stepHint =
    showDetectConfirm
      ? `根据${detectedSuggestion ? LOCATION_SOURCE_LABEL[detectedSuggestion.source] : '位置信息'}自动识别，请确认是否正确`
      : manualListMode && step === 'region'
        ? '从下方列表选择你的大洲'
        : manualListMode && step === 'country'
          ? '从下方列表选择你的国家'
          : step === 'faith'
            ? faithRegional
              ? `${countryName}的主流信仰推荐，选最贴近你内心的传统`
              : '请从完整列表中选择你的信仰或精神归属'
            : step === 'deity'
              ? '根据你的信仰，推荐以下守护神'
              : step === 'region'
                ? '在地图上点选任意国家，或从列表选择大洲'
                : '点选你的国家，确认后继续';

  const showInlineRegionList = manualListMode && !showDetectConfirm && step === 'region';
  const showInlineCountryList = manualListMode && !showDetectConfirm && step === 'country';
  const showListFooter =
    !showInlineFaithPicker &&
    !showInlineDeityPicker &&
    !showInlineRegionList &&
    !showInlineCountryList &&
    !showDetectConfirm &&
    step !== 'faith' &&
    step !== 'deity';

  const listButtonLabel =
    step === 'region' ? '列表选大洲' : step === 'country' ? '列表选国家' : '列表';

  const pendingConfirm =
    showDetectConfirm || manualListMode || step === 'faith' || step === 'deity'
      ? null
      : step === 'region' && pendingRegion
      ? {
          emoji: '🌍',
          name: pendingRegionOption?.nameZh ?? pendingRegion,
          sub: pendingRegionOption?.nameEn ?? '',
        }
        : step === 'country' && pendingCountry
        ? {
            emoji: '📍',
            name: pendingCountryOption?.nameZh ?? pendingCountry,
            sub: pendingCountryOption?.nameEn ?? '',
          }
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
        <JourneyVectorMap
          step={mapStep}
          allCountries={allCountries}
          countries={mapCountries}
          continentCode={mapContinentCode}
          countryCode={mapCountryCode}
          faithMarkers={[]}
          selectedId={
            showDetectConfirm
              ? detectedSuggestion?.country.code ?? null
              : selectedMapId
          }
          onSelect={handleMapSelect}
          ambient={mapAmbient}
          ariaLabel={
            mapAmbient
              ? '世界地图背景'
              : step === 'region'
                ? '世界地图，点选国家以选择大洲'
                : step === 'country'
                  ? '区域地图，点选国家'
                  : '国家地图，点选信仰'
          }
        />
      </div>

      <div className="geo-journey-overlay">
        <div className="geo-journey-top">
          <header className="geo-journey-header">
            {step !== 'region' ? (
              <button type="button" className="geo-journey-back" onClick={goBack}>
                ← 返回
              </button>
            ) : (
              <span className="geo-journey-back-spacer" />
            )}

            <div className="geo-journey-steps" aria-label="进度">
              {stepLabels.map((label, i) => (
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
            {locationResolving && !showDetectConfirm && !manualListMode ? (
              <div className="geo-journey-locating-wrap">
                <p className="geo-journey-locating">正在尝试根据你的位置识别国家…</p>
                <button
                  type="button"
                  className="geo-journey-locating-skip"
                  onClick={skipToManualSelection}
                >
                  跳过，手动选择
                </button>
              </div>
            ) : null}
          </div>

          {showDetectConfirm && detectedSuggestion ? (
            <div className="geo-journey-detect-confirm" role="region" aria-label="确认国家">
              <p className="geo-journey-detect-lead">
                根据{LOCATION_SOURCE_LABEL[detectedSuggestion.source]}，我们判断你在
              </p>
              <p className="geo-journey-detect-country">{detectedSuggestion.country.nameZh}</p>
              <p className="geo-journey-detect-sub">{detectedSuggestion.country.nameEn}</p>
              <p className="geo-journey-detect-question">这是你所在的国家吗？</p>
              <div className="geo-journey-detect-actions">
                <button type="button" className="btn-primary" onClick={confirmDetectedCountry}>
                  正确，继续
                </button>
                <button type="button" className="btn-outline" onClick={rejectDetectedCountry}>
                  不是，手动选择
                </button>
              </div>
            </div>
          ) : null}

          {showInlineRegionList ? (
            <div className="geo-journey-inline-list">
              <div className="geo-country-list">
                {regions.map((r) => (
                  <button
                    key={r.code}
                    type="button"
                    className={`geo-country-item${continentCode === r.code ? ' is-selected' : ''}`}
                    onClick={() => pickRegion(r.code)}
                  >
                    <span>
                      <span className="geo-country-item-name">{r.nameZh}</span>
                      <span className="geo-country-item-en">{r.nameEn}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showInlineCountryList ? (
            <div className="geo-journey-inline-list">
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
                      className={`geo-country-item${countryCode === c.code ? ' is-selected' : ''}`}
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
            </div>
          ) : null}

          {showLocationBadge && (
            <div className="geo-journey-location-badge">
              <span>
                已根据{LOCATION_SOURCE_LABEL[locationSource]}选择
                <strong>{countryName}</strong>
              </span>
              <button type="button" className="geo-journey-location-change" onClick={changeCountry}>
                更改
              </button>
            </div>
          )}

          {showInlineFaithPicker && (
            <div className="geo-journey-faith-panel">
              {faithsLoading ? (
                <div className="geo-journey-loading">正在加载信仰列表…</div>
              ) : (
                <FaithPicker
                  value={pendingFaith ?? value?.faith}
                  countryCode={countryCode}
                  onChange={onFaithPicked}
                  title=""
                  subtitle=""
                  confirmLabel={faithConfirmLabel}
                  customFirst
                />
              )}
            </div>
          )}

          {showInlineDeityPicker && (
            <div className="geo-journey-deity-panel">
              {sanctuariesLoading ? (
                <div className="geo-journey-loading">正在加载守护神推荐…</div>
              ) : sanctuaries.length === 0 ? (
                <div className="geo-journey-empty-deity">
                  此信仰暂未开放守护神，请返回上一步选择其他信仰。
                </div>
              ) : (
                <div className="geo-journey-deity-grid">
                  {sanctuaries.map((deity) => (
                    <button
                      key={deity.id}
                      type="button"
                      className={`geo-journey-deity-card${pendingDeity === deity.id ? ' is-selected' : ''}`}
                      onClick={() => onDeityPicked(deity.id)}
                    >
                      <span className="geo-journey-deity-avatar">
                        <img src={deity.imageUrl} alt={deity.name} />
                      </span>
                      <span className="geo-journey-deity-name">{deity.name}</span>
                      <span className="geo-journey-deity-en">{deity.nameEN}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="geo-journey-bottom">
          {showListFooter ? (
            <footer className="geo-journey-footer">
              <button
                type="button"
                className="btn-outline geo-journey-list-btn"
                onClick={() => setListOpen(true)}
              >
                {listButtonLabel}
              </button>
            </footer>
          ) : null}
        </div>
      </div>

      {pendingConfirm && !showInlineFaithPicker && (
        <div className="geo-journey-confirm-dock" role="region" aria-label="确认选择">
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
        </div>
      )}

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

          </div>
        </div>
      )}
    </div>
  );
}
