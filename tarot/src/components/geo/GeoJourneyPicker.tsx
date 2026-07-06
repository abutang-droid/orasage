'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaithPicker } from '@/components/FaithPicker';
import { WorldMapSvg } from '@/components/geo/WorldMapSvg';
import type { GeoCountry, GeoJourneySelection, GeoRegion } from '@/lib/geo/types';
import { storeGeo } from '@/lib/geo/types';
import './geo-journey.css';

type JourneyStep = 'region' | 'country' | 'faith';

type GeoJourneyPickerProps = {
  value?: Partial<GeoJourneySelection>;
  onComplete: (result: GeoJourneySelection) => void;
  title?: string;
  subtitle?: string;
  faithConfirmLabel?: string;
};

type SuggestResponse = {
  suggestedCode: string | null;
  country: GeoCountry | null;
  source: string;
};

export function GeoJourneyPicker({
  value,
  onComplete,
  title = '第一步 · 你的心灵故乡',
  subtitle = '从世界地图出发，找到与你最贴近的国家与信仰',
  faithConfirmLabel = '下一步 · 选择圣地',
}: GeoJourneyPickerProps) {
  const [step, setStep] = useState<JourneyStep>('region');
  const [regions, setRegions] = useState<GeoRegion[]>([]);
  const [countries, setCountries] = useState<GeoCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [continentCode, setContinentCode] = useState(value?.continentCode ?? '');
  const [countryCode, setCountryCode] = useState(value?.countryCode ?? '');
  const [suggested, setSuggested] = useState<SuggestResponse | null>(null);

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
          setContinentCode(suggestData.country.regionCode);
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

  const selectRegion = useCallback(
    (code: string) => {
      setContinentCode(code);
      setCountryCode('');
      setSearch('');
      setStep('country');
      void loadCountries(code);
    },
    [loadCountries],
  );

  useEffect(() => {
    if (step === 'country' && continentCode && countries.length === 0 && !countriesLoading) {
      void loadCountries(continentCode);
    }
  }, [step, continentCode, countries.length, countriesLoading, loadCountries]);

  const selectCountry = useCallback((code: string) => {
    setCountryCode(code);
    storeGeo(continentCode, code);
    setStep('faith');
  }, [continentCode]);

  const onFaithPick = useCallback(
    (faithId: string) => {
      if (!continentCode || !countryCode) return;
      storeGeo(continentCode, countryCode);
      onComplete({ continentCode, countryCode, faith: faithId });
    },
    [continentCode, countryCode, onComplete],
  );

  const regionName = useMemo(
    () => regions.find((r) => r.code === continentCode)?.nameZh ?? '',
    [regions, continentCode],
  );

  const countryName = useMemo(
    () => countries.find((c) => c.code === countryCode)?.nameZh ?? suggested?.country?.nameZh ?? '',
    [countries, countryCode, suggested?.country?.nameZh],
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

  const showSuggestBanner =
    step === 'country' &&
    suggested?.country &&
    suggested.country.regionCode === continentCode &&
    !countryCode;

  const stepIndex = step === 'region' ? 0 : step === 'country' ? 1 : 2;

  const goBack = () => {
    if (step === 'faith') {
      setStep('country');
      return;
    }
    if (step === 'country') {
      setStep('region');
      setCountryCode('');
      setSearch('');
    }
  };

  if (loading) {
    return <div className="geo-journey-loading">正在加载世界地图…</div>;
  }

  return (
    <div className="geo-journey">
      <div className="geo-journey-steps" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`geo-journey-step${i < stepIndex ? ' is-done' : ''}${i === stepIndex ? ' is-current' : ''}`}
          />
        ))}
      </div>

      {(title || subtitle) && step === 'region' && (
        <div className="page-header" style={{ padding: '16px 0' }}>
          <span className="label">地理旅程</span>
          {title ? <h1>{title}</h1> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      )}

      {step !== 'region' && (
        <button type="button" className="geo-journey-back" onClick={goBack}>
          ← 返回{step === 'country' ? '大洲' : '国家'}
        </button>
      )}

      {step === 'region' && (
        <>
          <WorldMapSvg
            regions={regions}
            selectedCode={continentCode || null}
            onSelect={selectRegion}
          />
          <p className="geo-journey-region-hint">点选大洲，再选择国家与信仰</p>
        </>
      )}

      {step === 'country' && (
        <>
          <div className="page-header" style={{ padding: '8px 0 0' }}>
            <span className="label">{regionName}</span>
            <h1>选择国家或地区</h1>
            <p>我们会根据当地主流信仰为你推荐</p>
          </div>

          {showSuggestBanner && suggested?.country && (
            <div className="geo-country-suggest">
              <div className="geo-country-suggest-lead">根据你的位置推荐</div>
              <button
                type="button"
                className="geo-country-suggest-btn"
                onClick={() => selectCountry(suggested.country!.code)}
              >
                <span style={{ fontSize: 20 }}>📍</span>
                <span>
                  <span className="geo-country-suggest-name">{suggested.country.nameZh}</span>
                  <span className="geo-country-suggest-en">{suggested.country.nameEn}</span>
                </span>
              </button>
            </div>
          )}

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
                  onClick={() => selectCountry(c.code)}
                >
                  <span>
                    <span className="geo-country-item-name">{c.nameZh}</span>
                    <span className="geo-country-item-en">{c.nameEn}</span>
                  </span>
                  {countryCode === c.code ? (
                    <span className="geo-country-item-check">✓</span>
                  ) : null}
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="geo-journey-loading">没有匹配的国家</div>
              )}
            </div>
          )}
        </>
      )}

      {step === 'faith' && countryCode && (
        <div className="geo-journey-faith-wrap">
          <div className="geo-journey-faith-context">
            {regionName} · {countryName} — 选择与你心灵相近的信仰
          </div>
          <FaithPicker
            value={value?.faith}
            countryCode={countryCode}
            onChange={onFaithPick}
            title="选择信仰"
            subtitle="已按当地主流程度排序；也可选择「其他」"
            confirmLabel={faithConfirmLabel}
          />
        </div>
      )}
    </div>
  );
}
