'use client';

import { useState, useEffect, useCallback } from 'react';
import { useT } from '@/lib/i18n';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import type { BirthInfo, ZiweiChart, Star, Palace } from '@/lib/ziwei/types';
import { formToSearchParams, searchParamsToForm, formToBirthInfo } from '@/lib/ziwei/share';
import { generateChart } from '@/lib/ziwei/algorithm';
import { syncBirthFormProfile } from '@/lib/profile-sync';
import { syncZiweiReading } from '@/lib/reading-sync';
import { ZiweiHomeHero } from '@/components/ZiweiHomeHero';
import { ZiweiHomeFeed } from '@/components/ZiweiHomeFeed';
import { ZiweiBriefInsight } from '@/components/ZiweiBriefInsight';
import { ZiweiOrasageChat } from '@/components/ZiweiOrasageChat';
import { ZiweiRecommendCard } from '@/components/ZiweiRecommendCard';
import { getLastReadingId, saveLastReadingId } from '@/lib/ziwei-reading-session';

type FocusState =
  | { type: 'star'; label: string; star: Star; palace: Palace }
  | { type: 'palace'; label: string; palace: Palace }
  | { type: 'sihua'; label: string; siHua: string };

const emptyBirthForm = (): BirthFormState => ({
  name: '', year: '', month: '', day: '', clockHour: '8', clockMinute: '0',
  unknownTime: false, province: '', city: '', longitude: 120, gender: 'male', calendar: 'solar',
});

function HemingPanel({
  onSubmit,
  loading,
}: {
  onSubmit: (a: BirthInfo, b: BirthInfo, formA: BirthFormState, formB: BirthFormState) => void;
  loading: boolean;
}) {
  const t = useT();
  const [activePerson, setActivePerson] = useState<0 | 1>(0);
  const [forms, setForms] = useState<[BirthFormState, BirthFormState]>([emptyBirthForm(), emptyBirthForm()]);
  const canSubmit =
    forms[0].year && forms[0].month && forms[0].day &&
    forms[1].year && forms[1].month && forms[1].day;

  return (
    <>
      <div className="ziwei-calc-person-tabs">
        <span className="ziwei-calc-person-hint">{t('form.person.editing')}</span>
        {([0, 1] as const).map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActivePerson(idx)}
            className={`ziwei-calc-person-tab${activePerson === idx ? ' is-active' : ''}`}
          >
            {idx === 0 ? t('form.person.first') : t('form.person.second')}
          </button>
        ))}
      </div>
      <BirthForm
        key={activePerson}
        onSubmit={() => {}}
        loading={false}
        hideSubmit
        initialData={forms[activePerson]}
        onFormSave={(data) => {
          setForms((prev) => {
            const next = [...prev] as [BirthFormState, BirthFormState];
            next[activePerson] = data;
            return next;
          });
        }}
      />
      <button
        type="button"
        onClick={() => onSubmit(formToBirthInfo(forms[0]), formToBirthInfo(forms[1]), forms[0], forms[1])}
        disabled={!canSubmit || loading}
        className="ziwei-calc-submit"
      >
        {loading ? t('heming.submit.loading') : t('heming.submit')}
      </button>
    </>
  );
}

export default function ChartPage() {
  const t = useT();
  const [mode, setMode] = useState<'single' | 'heming'>('single');
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [chartB, setChartB] = useState<ZiweiChart | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedForm, setSavedForm] = useState<BirthFormState | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [hemingTab, setHemingTab] = useState<'A' | 'B'>('A');
  const [loggedIn, setLoggedIn] = useState(false);
  const [recommendDismissed, setRecommendDismissed] = useState(false);
  const [chatSessionKey, setChatSessionKey] = useState(0);

  const refreshAuth = useCallback(() => {
    void fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d: { user?: unknown }) => setLoggedIn(Boolean(d.user)))
      .catch(() => setLoggedIn(false));
  }, []);

  useEffect(() => {
    refreshAuth();
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'heming') setMode('heming');
    if (params.get('paid') === '1') {
      const url = new URL(window.location.href);
      url.searchParams.delete('paid');
      url.searchParams.delete('order');
      window.history.replaceState({}, '', url.pathname + url.search);
      refreshAuth();
    }
    const formData = searchParamsToForm(params);
    if (!formData?.year) return;
    const fullForm: BirthFormState = {
      ...emptyBirthForm(),
      ...formData,
    };
    setSavedForm(fullForm);
    void handleSingleSubmit(formToBirthInfo(fullForm), fullForm);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bindReading = (id: string) => {
    setReadingId(id);
    saveLastReadingId(id);
    setRecommendDismissed(false);
    setChatSessionKey((k) => k + 1);
  };

  const handleSingleSubmit = async (info: BirthInfo, form?: BirthFormState) => {
    setLoading(true);
    setError('');
    try {
      const data = generateChart(info);
      setChart(data);
      setChartB(null);
      const syncForm = form ?? savedForm;
      if (syncForm) void syncBirthFormProfile(syncForm);
      const id = syncZiweiReading(data);
      bindReading(id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('insight.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleHemingSubmit = async (
    infoA: BirthInfo,
    infoB: BirthInfo,
    formA: BirthFormState,
    formB: BirthFormState,
  ) => {
    setLoading(true);
    setError('');
    try {
      const dataA = generateChart(infoA);
      const dataB = generateChart(infoB);
      setChart(dataA);
      setChartB(dataB);
      setHemingTab('A');
      void syncBirthFormProfile(formA, { label: 'A' });
      void syncBirthFormProfile(formB, { label: 'B' });
      const id = syncZiweiReading(dataA, { couplePartner: dataB });
      bindReading(id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('insight.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setChart(null);
    setChartB(null);
    setReadingId(null);
    setError('');
    setSavedForm(null);
    setFormKey((k) => k + 1);
    setRecommendDismissed(false);
    if (typeof window !== 'undefined') window.history.replaceState({}, '', '/chart');
  };

  const activeChart = mode === 'heming' && hemingTab === 'B' && chartB ? chartB : chart;
  const activeReadingId = readingId ?? getLastReadingId() ?? '';

  if (!chart) {
    return (
      <div className="ziwei-chart-page orasage-fade-in">
        <ZiweiHomeHero />
        <div className="ziwei-calc-form ziwei-calc-section">
          <div className="ziwei-calc-mode-bar">
            {(['single', 'heming'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`ziwei-calc-mode-btn${mode === m ? ' is-active' : ''}`}
              >
                {m === 'single' ? t('tab.single') : t('tab.heming')}
              </button>
            ))}
          </div>
          {mode === 'single' ? (
            <BirthForm
              key={formKey}
              onSubmit={handleSingleSubmit}
              loading={loading}
              initialData={savedForm ?? undefined}
              onFormSave={(form) => {
                setSavedForm(form);
                if (form.year && form.month && form.day) {
                  const params = formToSearchParams(form);
                  if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', `/chart?${params.toString()}`);
                  }
                }
              }}
            />
          ) : (
            <HemingPanel onSubmit={handleHemingSubmit} loading={loading} />
          )}
          {error && <div className="ziwei-calc-error">{error}</div>}
        </div>
        <ZiweiHomeFeed />
      </div>
    );
  }

  const chartData =
    mode === 'heming' && chart && chartB
      ? { chartA: chart, chartB }
      : activeChart ?? chart;

  return (
    <div className="chart-page-root orasage-fade-in">
      <div className="ziwei-chart-toolbar">
        <button type="button" onClick={handleReset} className="ziwei-reset-btn">
          <span>‹</span>
          {t('chart.reset')}
        </button>
        <div className="ziwei-chart-toolbar-sep" />
        {mode === 'heming' && chartB ? (
          <div className="ziwei-heming-tabs">
            {(['A', 'B'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setHemingTab(tab)}
                className={`ziwei-heming-tab${hemingTab === tab ? ' is-active' : ''}`}
              >
                {tab === 'A' ? `甲 · ${t('heming.person.a')}` : `乙 · ${t('heming.person.b')}`}
              </button>
            ))}
          </div>
        ) : (
          <span className="ziwei-chart-label">{t('chart.title')}</span>
        )}
      </div>

      <div className="ziwei-result-stack">
        <div className="ziwei-result-chart">
          <ChartBoard chart={activeChart ?? chart} />
        </div>

        <ZiweiBriefInsight chart={activeChart ?? chart} />

        {activeReadingId ? (
          <ZiweiOrasageChat
            key={`${activeReadingId}-${chatSessionKey}`}
            chart={activeChart ?? chart}
            chartData={chartData}
            mode={mode === 'heming' ? 'heming' : 'single'}
            readingId={activeReadingId}
            loggedIn={loggedIn}
          />
        ) : null}

        {activeReadingId ? (
          <ZiweiRecommendCard
            readingId={activeReadingId}
            sessionKey={`${activeReadingId}-${chatSessionKey}`}
            dismissed={recommendDismissed}
            onDismiss={() => setRecommendDismissed(true)}
          />
        ) : null}
      </div>
    </div>
  );
}
