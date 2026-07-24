'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@orasage/ui/button';
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
import { useGeoCopy, geo, formatTemplate } from '@/lib/i18n/ui-strings';
import { useLang } from '@/lib/i18n/context';
import { deityDisplayName, deitySubtitle } from '@/lib/i18n/deity-locale';
import './geo-journey.css';

const JourneyVectorMap = dynamic(
  () => import('@/components/geo/JourneyVectorMap').then((m) => m.JourneyVectorMap),
  {
    ssr: false,
    loading: () => <div className="geo-journey-loading" />,
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
  /** 信仰步骤显示「跳过」并回调（不选信仰直接进入后续流程） */
  onFaithSkip?: (ctx: { continentCode: string; countryCode: string }) => void;
};

type FaithApiResponse = {
  faiths?: FaithOption[];
  regional?: boolean;
};

export function GeoJourneyPicker({
  value,
  onComplete,
  title,
  subtitle,
  faithConfirmLabel,
  deityConfirmLabel,
  pickDeity = false,
  fullscreen = true,
  onFaithSkip,
}: GeoJourneyPickerProps) {
  const { p, sourceLabel } = useGeoCopy();
  const { lang } = useLang();
  const resolvedTitle = title ?? p(geo.defaultTitle);
  const resolvedSubtitle = subtitle ?? p(geo.defaultSubtitle);
  const resolvedFaithConfirm = faithConfirmLabel ?? p(geo.faithConfirm);
  const resolvedDeityConfirm = deityConfirmLabel ?? p(geo.deityConfirm);
  const stepLabelsBase = [p(geo.stepContinent), p(geo.stepCountry), p(geo.stepFaith)] as const;
  const stepLabels = pickDeity ? [...stepLabelsBase, p(geo.stepDeity)] : [...stepLabelsBase];
  const confirmLabels: Record<Exclude<JourneyStep, 'deity'>, string> = {
    region: p(geo.confirmRegion),
    country: p(geo.confirmCountry),
    faith: p(geo.nextFaith),
  };
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
  const [gpsFailed, setGpsFailed] = useState(false);
  const initDone = useRef(false);
  const countriesRequest = useRef(0);

  const { suggestion, resolving: locationResolving, resolved: locationResolved, requestGps, gpsResolving, gpsAvailable } = useCountrySuggestion(
    allCountries,
    !loading && allCountries.length > 0 && !value?.countryCode,
  );

  const confirmLabel =
    step === 'faith'
      ? resolvedFaithConfirm
      : step === 'deity'
        ? resolvedDeityConfirm
        : confirmLabels[step as keyof typeof confirmLabels];

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
    const requestId = ++countriesRequest.current;
    setCountries([]);
    setCountriesLoading(true);
    try {
      const res = await fetch(`/api/geo/countries?region=${encodeURIComponent(region)}`);
      const data = res.ok ? await res.json() : null;
      if (requestId !== countriesRequest.current) return;
      setCountries(data?.countries ?? []);
    } catch {
      if (requestId !== countriesRequest.current) return;
      setCountries([]);
    } finally {
      if (requestId === countriesRequest.current) setCountriesLoading(false);
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
    if (countryCode || detectedSuggestion || continentCode) return;

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
    detectedSuggestion,
    continentCode,
    value?.continentCode,
    value?.countryCode,
    loadCountries,
  ]);

  const applySuggestion = useCallback(
    (next: CountrySuggestion) => {
      setGpsFailed(false);
      setDetectedSuggestion(next);
      setManualListMode(false);
      void loadCountries(next.country.regionCode);
    },
    [loadCountries],
  );

  const handleUseGps = useCallback(async () => {
    setGpsFailed(false);
    const result = await requestGps();
    if (result) {
      applySuggestion(result);
      return;
    }
    setGpsFailed(true);
  }, [requestGps, applySuggestion]);

  const pickRegion = useCallback((code: string) => {
    setPendingRegion(code);
    setListOpen(false);
    if (manualListMode) {
      setCountries([]);
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
    setCountries([]);
    setContinentCode('');
    setCountryCode('');
    setPendingCountry(null);
    setPendingRegion(null);
    setStep('region');
  }, []);

  const skipToManualSelection = useCallback(() => {
    setDetectedSuggestion(null);
    setManualListMode(true);
    setCountries([]);
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
    setCountries([]);
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

  const handleFaithSkipClick = useCallback(() => {
    if (!onFaithSkip || !continentCode || !countryCode) return;
    onFaithSkip({ continentCode, countryCode });
  }, [onFaithSkip, continentCode, countryCode]);

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

  const showGpsPrompt =
    locationResolved &&
    !showDetectConfirm &&
    !countryCode &&
    gpsAvailable &&
    (manualListMode || !suggestion) &&
    step === 'region' &&
    !gpsResolving;

  const showGpsLocating = gpsResolving;

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
  const mapCountries = useMemo(() => {
    if (showDetectConfirm && detectedSuggestion) {
      return allCountries.filter((c) => c.regionCode === detectedSuggestion.country.regionCode);
    }
    if (continentCode && (step === 'country' || step === 'faith' || step === 'deity')) {
      return allCountries.filter((c) => c.regionCode === continentCode);
    }
    return countries;
  }, [
    showDetectConfirm,
    detectedSuggestion,
    continentCode,
    step,
    allCountries,
    countries,
  ]);

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
      setCountries([]);
      setContinentCode('');
      setStep('region');
      setCountryCode('');
      setSearch('');
    }
  };

  const stepTitle =
    showDetectConfirm && detectedSuggestion
      ? p(geo.confirmCountryTitle)
      : step === 'region'
        ? resolvedTitle
        : step === 'country'
          ? formatTemplate(p(geo.titleCountry), { name: regionName })
          : step === 'faith'
            ? formatTemplate(p(geo.titleFaith), { name: countryName })
            : formatTemplate(p(geo.titleDeity), { name: formatFaithLabel(pendingFaith, faiths, lang) });

  const stepHint =
    showDetectConfirm
      ? formatTemplate(p(geo.hintDetect), {
          source: detectedSuggestion ? sourceLabel[detectedSuggestion.source] : p(geo.sourceManual),
        })
      : manualListMode && step === 'region'
        ? p(geo.hintListRegion)
        : manualListMode && step === 'country'
          ? p(geo.hintListCountry)
          : step === 'faith'
            ? faithRegional
              ? formatTemplate(p(geo.hintFaithRegional), { country: countryName })
              : p(geo.hintFaithGlobal)
            : step === 'deity'
              ? p(geo.hintDeity)
              : step === 'region'
                ? p(geo.hintRegionMap)
                : p(geo.hintCountryMap);

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
    step === 'region' ? p(geo.listRegion) : step === 'country' ? p(geo.listCountry) : p(geo.listGeneric);

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
        <div className="geo-journey-loading">{p(geo.loadingMap)}</div>
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
          gestureHint={p(geo.mapGestureHint)}
          ariaLabel={
            mapAmbient
              ? p(geo.mapBg)
              : step === 'region'
                ? p(geo.mapRegion)
                : step === 'country'
                  ? p(geo.mapCountry)
                  : p(geo.mapFaith)
          }
        />
      </div>

      <div className="geo-journey-overlay">
        <div className="geo-journey-top">
          <header className="geo-journey-header">
            {step !== 'region' ? (
              <button type="button" className="geo-journey-back" onClick={goBack}>
                {p(geo.back)}
              </button>
            ) : (
              <span className="geo-journey-back-spacer" />
            )}

            <div className="geo-journey-steps" aria-label={p(geo.progress)}>
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
            {step === 'region' && resolvedSubtitle ? (
              <p className="geo-journey-subtitle">{resolvedSubtitle}</p>
            ) : null}
            <h1 className="geo-journey-title">{stepTitle}</h1>
            <p className="geo-journey-hint">{stepHint}</p>
            {showGpsLocating ? (
              <div className="geo-journey-locating-wrap">
                <p className="geo-journey-locating">{p(geo.locating)}</p>
                <button
                  type="button"
                  className="geo-journey-locating-skip"
                  onClick={skipToManualSelection}
                >
                  {p(geo.skipManual)}
                </button>
              </div>
            ) : null}
            {showGpsPrompt ? (
              <div className="geo-journey-gps-prompt">
                <Button type="button" variant="outline" onClick={() => void handleUseGps()}>
                  {p(geo.useGps)}
                </Button>
              </div>
            ) : null}
            {gpsFailed && !showGpsLocating ? (
              <p className="geo-journey-gps-failed">{p(geo.gpsFailed)}</p>
            ) : null}
          </div>

          {showDetectConfirm && detectedSuggestion ? (
            <div className="geo-journey-detect-confirm" role="region" aria-label={p(geo.confirmCountryRegion)}>
              <p className="geo-journey-detect-lead">
                {formatTemplate(p(geo.detectLead), { source: sourceLabel[detectedSuggestion.source] })}
              </p>
              <p className="geo-journey-detect-country">{detectedSuggestion.country.nameZh}</p>
              <p className="geo-journey-detect-sub">{detectedSuggestion.country.nameEn}</p>
              <p className="geo-journey-detect-question">{p(geo.detectQuestion)}</p>
              <div className="geo-journey-detect-actions">
                <Button type="button" onClick={confirmDetectedCountry}>
                  {p(geo.detectYes)}
                </Button>
                <Button type="button" variant="outline" onClick={rejectDetectedCountry}>
                  {p(geo.detectNo)}
                </Button>
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
                  placeholder={p(geo.searchCountry)}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {countriesLoading ? (
                <div className="geo-journey-loading">{p(geo.loadingCountries)}</div>
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
                {formatTemplate(p(geo.selectedBy), { source: sourceLabel[locationSource] })}
                <strong>{countryName}</strong>
              </span>
              <button type="button" className="geo-journey-location-change" onClick={changeCountry}>
                {p(geo.change)}
              </button>
            </div>
          )}

          {showInlineFaithPicker && (
            <div className="geo-journey-faith-panel">
              {faithsLoading ? (
                <div className="geo-journey-loading">{p(geo.loadingFaiths)}</div>
              ) : (
                <FaithPicker
                  value={pendingFaith ?? value?.faith}
                  countryCode={countryCode}
                  onChange={onFaithPicked}
                  onSkip={onFaithSkip ? handleFaithSkipClick : undefined}
                  title=""
                  subtitle=""
                  confirmLabel={resolvedFaithConfirm}
                  customFirst
                />
              )}
            </div>
          )}

          {showInlineDeityPicker && (
            <div className="geo-journey-deity-panel">
              {sanctuariesLoading ? (
                <div className="geo-journey-loading">{p(geo.loadingDeities)}</div>
              ) : sanctuaries.length === 0 ? (
                <div className="geo-journey-empty-deity">
                  {p(geo.noDeity)}
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
                        <img src={deity.imageUrl} alt={deityDisplayName(deity, lang)} />
                      </span>
                      <span className="geo-journey-deity-name">{deityDisplayName(deity, lang)}</span>
                      {deitySubtitle(deity, lang) ? (
                        <span className="geo-journey-deity-en">{deitySubtitle(deity, lang)}</span>
                      ) : null}
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
              <Button
                type="button"
                variant="outline"
                className="geo-journey-list-btn"
                onClick={() => setListOpen(true)}
              >
                {listButtonLabel}
              </Button>
            </footer>
          ) : null}
        </div>
      </div>

      {pendingConfirm && !showInlineFaithPicker && (
        <div className="geo-journey-confirm-dock" role="region" aria-label={p(geo.confirmSelection)}>
          <div className="geo-journey-faith-confirm">
            <div className="geo-journey-faith-confirm-card">
              <span className="geo-journey-faith-confirm-emoji">{pendingConfirm.emoji}</span>
              <div>
                <div className="geo-journey-faith-confirm-name">{pendingConfirm.name}</div>
                <div className="geo-journey-faith-confirm-en">{pendingConfirm.sub}</div>
              </div>
            </div>
            <Button
              type="button"
              className="geo-journey-faith-confirm-btn w-full"
              onClick={confirmCurrentStep}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}

      {listOpen && (
        <div className="geo-journey-drawer" role="dialog" aria-modal="true">
          <button
            type="button"
            className="geo-journey-drawer-backdrop"
            aria-label={p(geo.closeList)}
            onClick={() => setListOpen(false)}
          />
          <div className="geo-journey-drawer-panel">
            <div className="geo-journey-drawer-handle" aria-hidden />
            <div className="geo-journey-drawer-header">
              <h2>{listButtonLabel}</h2>
              <button type="button" className="geo-journey-drawer-close" onClick={() => setListOpen(false)}>
                {p(geo.close)}
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
                    placeholder={p(geo.searchCountry)}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {countriesLoading ? (
                  <div className="geo-journey-loading">{p(geo.loadingCountries)}</div>
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
