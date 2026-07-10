'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@orasage/ui/button';
import { useT, useLocale } from '@/lib/i18n';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';
import { formToSearchParams, searchParamsToForm, formToBirthInfo } from '@/lib/ziwei/share';
import { generateChart } from '@/lib/ziwei/algorithm';
import { syncBirthFormProfile } from '@/lib/profile-sync';
import { syncZiweiReading } from '@/lib/reading-sync';
import { ZiweiHomeHero } from '@/components/ZiweiHomeHero';
import { ZiweiHomeFeed } from '@/components/ZiweiHomeFeed';
import { ZiweiBriefInsight } from '@/components/ZiweiBriefInsight';
import { ZiweiOrasageChat } from '@/components/ZiweiOrasageChat';
import { ZiweiRecommendCard } from '@/components/ZiweiRecommendCard';
import {
  clearChartSession,
  getLastReadingId,
  loadChartSession,
  saveChartSession,
  saveLastReadingId,
} from '@/lib/ziwei-reading-session';
import { isMinorChartPair } from '@/lib/minor';

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
          <Button
            key={idx}
            type="button"
            variant="outline"
            onClick={() => setActivePerson(idx)}
            className={`ziwei-calc-person-tab${activePerson === idx ? ' is-active' : ''}`}
          >
            {idx === 0 ? t('form.person.first') : t('form.person.second')}
          </Button>
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
      <Button
        type="button"
        onClick={() => onSubmit(formToBirthInfo(forms[0]), formToBirthInfo(forms[1]), forms[0], forms[1])}
        disabled={!canSubmit || loading}
        loading={loading}
        className="ziwei-calc-submit w-full"
      >
        {t('heming.submit')}
      </Button>
    </>
  );
}

function persistChartUrl(form: BirthFormState, opts: { readingId: string; mode?: 'single' | 'heming' }) {
  const params = formToSearchParams(form, { readingId: opts.readingId, mode: opts.mode });
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', `/chart?${params.toString()}`);
  }
}

export default function ChartPage() {
  const t = useT();
  const { locale } = useLocale();
  const [mode, setMode] = useState<'single' | 'heming'>('single');
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [chartB, setChartB] = useState<ZiweiChart | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedForm, setSavedForm] = useState<BirthFormState | null>(null);
  const [savedFormB, setSavedFormB] = useState<BirthFormState | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [hemingTab, setHemingTab] = useState<'A' | 'B'>('A');
  const [loggedIn, setLoggedIn] = useState(false);
  const [recommendDismissed, setRecommendDismissed] = useState(false);
  const [chatSessionKey, setChatSessionKey] = useState(0);
  const [postPaidFocus, setPostPaidFocus] = useState(false);
  const chatAnchorRef = useRef<HTMLDivElement>(null);

  const refreshAuth = useCallback(() => {
    void fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d: { user?: unknown }) => setLoggedIn(Boolean(d.user)))
      .catch(() => setLoggedIn(false));
  }, []);

  const bindReading = (id: string, opts?: { resetChat?: boolean }) => {
    setReadingId(id);
    saveLastReadingId(id);
    setRecommendDismissed(false);
    if (opts?.resetChat !== false) {
      setChatSessionKey((k) => k + 1);
    }
  };

  const handleSingleSubmit = async (
    info: BirthInfo,
    form?: BirthFormState,
    existingReadingId?: string,
  ) => {
    setLoading(true);
    setError('');
    try {
      const data = generateChart(info);
      setChart(data);
      setChartB(null);
      const syncForm = form ?? savedForm;
      if (syncForm) void syncBirthFormProfile(syncForm);
      const rid = existingReadingId ?? getLastReadingId() ?? undefined;
      const id = syncZiweiReading(data, { existingReadingId: rid, lang: locale });
      bindReading(id, { resetChat: !existingReadingId });
      if (syncForm) {
        saveChartSession({ readingId: id, mode: 'single', form: syncForm });
        persistChartUrl(syncForm, { readingId: id });
      }
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
    existingReadingId?: string,
  ) => {
    setLoading(true);
    setError('');
    try {
      const dataA = generateChart(infoA);
      const dataB = generateChart(infoB);
      setChart(dataA);
      setChartB(dataB);
      setHemingTab('A');
      setSavedFormB(formB);
      void syncBirthFormProfile(formA, { label: 'A' });
      void syncBirthFormProfile(formB, { label: 'B' });
      const rid = existingReadingId ?? getLastReadingId() ?? undefined;
      const id = syncZiweiReading(dataA, { couplePartner: dataB, existingReadingId: rid, lang: locale });
      bindReading(id, { resetChat: !existingReadingId });
      saveChartSession({ readingId: id, mode: 'heming', form: formA, formB });
      persistChartUrl(formA, { readingId: id, mode: 'heming' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('insight.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    if (urlMode === 'heming') setMode('heming');

    const paidReturn = params.get('paid') === '1';
    const focusChat = params.get('focus') === 'chat' || paidReturn;
    if (paidReturn) setPostPaidFocus(true);

    const rid = params.get('rid') || getLastReadingId() || undefined;
    const session = loadChartSession();
    const formData = searchParamsToForm(params);

    const restore = async () => {
      if (formData?.year) {
        const fullForm: BirthFormState = { ...emptyBirthForm(), ...formData };
        setSavedForm(fullForm);
        if (urlMode === 'heming' && session?.formB) {
          setSavedFormB(session.formB);
          await handleHemingSubmit(
            formToBirthInfo(fullForm),
            formToBirthInfo(session.formB),
            fullForm,
            session.formB,
            rid,
          );
        } else {
          await handleSingleSubmit(formToBirthInfo(fullForm), fullForm, rid);
        }
        return;
      }

      if (session?.form?.year) {
        setSavedForm(session.form);
        if (session.mode === 'heming' && session.formB) {
          setMode('heming');
          setSavedFormB(session.formB);
          await handleHemingSubmit(
            formToBirthInfo(session.form),
            formToBirthInfo(session.formB),
            session.form,
            session.formB,
            session.readingId || rid,
          );
        } else {
          await handleSingleSubmit(
            formToBirthInfo(session.form),
            session.form,
            session.readingId || rid,
          );
        }
      }
    };

    void restore().finally(() => {
      if (paidReturn || focusChat) {
        const url = new URL(window.location.href);
        url.searchParams.delete('paid');
        url.searchParams.delete('order');
        url.searchParams.delete('focus');
        window.history.replaceState({}, '', url.pathname + url.search);
        if (paidReturn) refreshAuth();
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!chart || !postPaidFocus) return;
    const timer = window.setTimeout(() => {
      chatAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPostPaidFocus(false);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [chart, postPaidFocus]);

  const handleReset = () => {
    setChart(null);
    setChartB(null);
    setReadingId(null);
    setError('');
    setSavedForm(null);
    setSavedFormB(null);
    setFormKey((k) => k + 1);
    setRecommendDismissed(false);
    clearChartSession();
    if (typeof window !== 'undefined') window.history.replaceState({}, '', '/chart');
  };

  const activeChart = mode === 'heming' && hemingTab === 'B' && chartB ? chartB : chart;
  const activeReadingId = readingId ?? getLastReadingId() ?? '';
  const minorMode = chart
    ? isMinorChartPair(chart, mode === 'heming' ? chartB : null)
    : false;

  if (!chart) {
    return (
      <div className="ziwei-chart-page orasage-fade-in">
        <ZiweiHomeHero />
        <div className="ziwei-calc-form ziwei-calc-section">
          <div className="ziwei-calc-mode-bar">
            {(['single', 'heming'] as const).map((m) => (
              <Button
                key={m}
                type="button"
                variant="outline"
                onClick={() => setMode(m)}
                className={`ziwei-calc-mode-btn${mode === m ? ' is-active' : ''}`}
              >
                {m === 'single' ? t('tab.single') : t('tab.heming')}
              </Button>
            ))}
          </div>
          {mode === 'single' ? (
            <BirthForm
              key={formKey}
              onSubmit={(info, form) => void handleSingleSubmit(info, form)}
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
            <HemingPanel onSubmit={(a, b, fa, fb) => void handleHemingSubmit(a, b, fa, fb)} loading={loading} />
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
        <Button type="button" variant="ghost" onClick={handleReset} className="ziwei-reset-btn h-auto min-h-0 px-0">
          <span>‹</span>
          {t('chart.reset')}
        </Button>
        <div className="ziwei-chart-toolbar-sep" />
        {mode === 'heming' && chartB ? (
          <div className="ziwei-heming-tabs">
            {(['A', 'B'] as const).map((tab) => (
              <Button
                key={tab}
                type="button"
                variant="outline"
                onClick={() => setHemingTab(tab)}
                className={`ziwei-heming-tab${hemingTab === tab ? ' is-active' : ''}`}
              >
                {tab === 'A' ? `甲 · ${t('heming.person.a')}` : `乙 · ${t('heming.person.b')}`}
              </Button>
            ))}
          </div>
        ) : (
          <span className="ziwei-chart-label">{t('chart.title')}</span>
        )}
      </div>

      {minorMode ? (
        <div className="ziwei-minor-banner" role="status">
          当前为未成年人命盘（未满 16 周岁），解读内容仅包含基础命格、健康、学业与未来方向。
        </div>
      ) : null}

      <div className="ziwei-result-stack">
        <div className="ziwei-result-chart ziwei-chart-rice-paper">
          <ChartBoard chart={activeChart ?? chart} />
        </div>

        <ZiweiBriefInsight chart={activeChart ?? chart} minorMode={minorMode} />

        {activeChart && !minorMode ? (
          <ZiweiRecommendCard
            chart={activeChart}
            sessionKey={`${activeReadingId ?? 'chart'}-${chatSessionKey}`}
            dismissed={recommendDismissed}
            onDismiss={() => setRecommendDismissed(true)}
          />
        ) : null}

        {activeReadingId ? (
          <div ref={chatAnchorRef} id="ziwei-orasage-chat">
            <ZiweiOrasageChat
              key={`${activeReadingId}-${chatSessionKey}`}
              chart={activeChart ?? chart}
              chartData={chartData}
              mode={mode === 'heming' ? 'heming' : 'single'}
              readingId={activeReadingId}
              loggedIn={loggedIn}
              minorMode={minorMode}
              postPaidRefresh={postPaidFocus}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
