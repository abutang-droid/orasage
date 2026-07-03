'use client';
import { useState, useEffect } from 'react';
import { useT } from '@/lib/i18n';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import TimeNav, { type TimeView } from '@/components/TimeNav';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import ChatPanel from '@/components/ChatPanel';
import type { BirthInfo, ZiweiChart, Star, Palace } from '@/lib/ziwei/types';
import { formToSearchParams, searchParamsToForm, formToBirthInfo } from '@/lib/ziwei/share';
import { useHistory } from '@/lib/ziwei/history';
type FocusState = any;
import { generateChart } from "@/lib/ziwei/algorithm";
import { syncBirthFormProfile } from '@/lib/profile-sync';
import { syncZiweiReading, ziweiCrystalRecommendation } from '@/lib/reading-sync';
import PaywallCard from '@/components/PaywallCard';
import CrystalShopCard from '@/components/CrystalShopCard';
import { ZiweiHomeHero } from '@/components/ZiweiHomeHero';
import { usePaymentFlow, saveLastReadingId } from '@/lib/usePaymentFlow';

// ─── 合盘输入：两人 Tab 切换（与八字 Home 合盘 UI 一致）────────────────────
const emptyBirthForm = (): BirthFormState => ({
  name: '', year: '', month: '', day: '', clockHour: '8', clockMinute: '0',
  unknownTime: false, province: '', city: '', longitude: 120, gender: 'male',
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

  const handleSubmit = () => {
    onSubmit(formToBirthInfo(forms[0]), formToBirthInfo(forms[1]), forms[0], forms[1]);
  };

  const personLabels = [t('form.person.first'), t('form.person.second')] as const;

  return (
    <>
      <div className="ziwei-calc-person-tabs">
        <span className="ziwei-calc-person-hint">{t('form.person.editing')}</span>
        {personLabels.map((label, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActivePerson(idx as 0 | 1)}
            className={`ziwei-calc-person-tab${activePerson === idx ? ' is-active' : ''}`}
          >
            {label}
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
            const next: [BirthFormState, BirthFormState] = [...prev] as [BirthFormState, BirthFormState];
            next[activePerson] = data;
            return next;
          });
        }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="ziwei-calc-submit"
      >
        {loading ? t('heming.submit.loading') : t('heming.submit')}
      </button>
    </>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────
export default function ChartPage() {
  const t = useT();
  const [mode, setMode] = useState<'single' | 'heming'>('single');
  const payment = usePaymentFlow(mode === 'heming' ? 'couple' : 'single');
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [chartB, setChartB] = useState<ZiweiChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedForm, setSavedForm] = useState<BirthFormState | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [view, setView] = useState<TimeView>('mingpan');
  const [liunianYear, setLiunianYear] = useState(new Date().getFullYear());
  const [focus, setFocus] = useState<FocusState | null>(null);
  const [hemingTab, setHemingTab] = useState<'A' | 'B'>('A');
  const { history, save: saveHistory, remove: removeHistory } = useHistory();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'heming') {
      setMode('heming');
    }
    const formData = searchParamsToForm(params);
    if (!formData?.year) return;
    const fullForm: BirthFormState = { name: '', year: '', month: '', day: '', clockHour: '8', clockMinute: '0', unknownTime: false, province: '', city: '', longitude: 120, gender: 'male', ...formData };
    setSavedForm(fullForm);
    handleSingleSubmit(formToBirthInfo(fullForm), fullForm);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSingleSubmit = async (info: BirthInfo, form?: BirthFormState) => {
    setLoading(true); setError('');
    payment.setUnlocked(false);
    try {
      const data = generateChart(info);
      setChart(data); setChartB(null); setFocus(null); setView('mingpan');
      const syncForm = form ?? savedForm;
      if (syncForm) void syncBirthFormProfile(syncForm);
      const readingId = syncZiweiReading(data);
      saveLastReadingId(readingId);
    }
    catch (e: unknown) { setError(e instanceof Error ? e.message : t('insight.error')); }
    finally { setLoading(false); }
  };

  const handleHemingSubmit = async (infoA: BirthInfo, infoB: BirthInfo, formA: BirthFormState, formB: BirthFormState) => {
    setLoading(true); setError('');
    payment.setUnlocked(false);
    try {
      const dataA = generateChart(infoA); const dataB = generateChart(infoB);
      setChart(dataA); setChartB(dataB); setFocus(null); setView('mingpan'); setHemingTab('A');
      void syncBirthFormProfile(formA, { label: 'A' });
      void syncBirthFormProfile(formB, { label: 'B' });
      const readingId = syncZiweiReading(dataA, { couplePartner: dataB });
      saveLastReadingId(readingId);
    }
    catch (e: unknown) { setError(e instanceof Error ? e.message : t('insight.error')); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setChart(null); setChartB(null); setError(''); setFocus(null); setSavedForm(null); setFormKey(k => k + 1); setView('mingpan');
    payment.setUnlocked(false);
    payment.setPurchasedPlan(null);
    if (typeof window !== 'undefined') window.history.replaceState({}, '', '/chart');
  };

  const handleStarClick = (star: Star, palace: Palace) => setFocus({ type: 'star', label: `${star.name} · ${palace.name}`, star, palace });
  const handlePalaceClick = (palace: Palace) => setFocus({ type: 'palace', label: palace.name, palace });
  const handleSiHuaBadgeClick = (starName: string, siHua: string) => setFocus({ type: 'sihua', label: `${starName} 化${siHua}`, siHua });

  const activeChart = mode === 'heming' && hemingTab === 'B' && chartB ? chartB : chart;
  const crystalRec = activeChart ? ziweiCrystalRecommendation(activeChart) : null;

  // ═══ 表单视图 ═══
  if (!chart) {
    return (
      <div className="ziwei-chart-page orasage-fade-in">
        <ZiweiHomeHero />

        <div className="ziwei-calc-form ziwei-calc-section">
          <div className="ziwei-calc-mode-bar">
            {(['single', 'heming'] as const).map(m => (
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
              onFormSave={form => {
                setSavedForm(form);
                if (form.year && form.month && form.day) {
                  saveHistory(form);
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

        {mode === 'single' && history.length > 0 && (
          <div className="ziwei-calc-history">
            <div className="ziwei-calc-history-header">
              <span className="ziwei-calc-history-label">{t('form.history')}</span>
              <div className="ziwei-calc-history-line" />
            </div>
            <div className="ziwei-calc-history-list">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="ziwei-calc-history-item"
                  onClick={() => { setSavedForm(entry.form); handleSingleSubmit(formToBirthInfo(entry.form), entry.form); }}
                >
                  <span className="ziwei-calc-history-item-label">{entry.label}</span>
                  <button
                    type="button"
                    className="ziwei-calc-history-item-remove"
                    onClick={e => { e.stopPropagation(); removeHistory(entry.id); }}
                    aria-label={t('common.close')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══ 命盘视图 ═══
  return (
    <div style={{ background: 'var(--bg-0)' }} className="orasage-fade-in">
      <div className="ziwei-chart-toolbar">
        <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--tx-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--tx-1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--tx-3)'; }}>
          <span style={{ fontSize: '16px' }}>‹</span><span>{t('chart.reset')}</span>
        </button>
        <div style={{ width: '1px', height: '20px', background: 'var(--bdr-med)' }} />
        {mode === 'heming' && chartB ? (
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', border: '1px solid var(--bdr)', borderRadius: 'var(--r-md)', padding: '3px' }}>
            {(['A', 'B'] as const).map(tab => (
              <button key={tab} onClick={() => setHemingTab(tab)}
                style={{ padding: '4px 14px', borderRadius: '6px', border: 'none', background: hemingTab === tab ? 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)' : 'transparent', color: hemingTab === tab ? '#fff' : 'var(--tx-2)', fontSize: '12px', fontWeight: hemingTab === tab ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                {tab === 'A' ? `甲 · ${t('heming.person.a')}` : `乙 · ${t('heming.person.b')}`}
              </button>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--gold)', letterSpacing: '0.15em' }}>{t('chart.title')}</span>
        )}
        <div style={{ flex: 1 }} />
        <TimeNav chart={activeChart ?? chart} view={view} liunianYear={liunianYear} onViewChange={setView} onYearChange={setLiunianYear} />
      </div>

      {crystalRec && !payment.unlocked && (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px 12px' }}>
          <CrystalShopCard reason={crystalRec.reason} crystalSku={crystalRec.crystalSku} />
        </div>
      )}

      {!payment.unlocked && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 16px' }}>
          {mode === 'heming' && (
            <div style={{
              marginBottom: 12, padding: '14px 16px', borderRadius: 'var(--r-md)',
              background: 'var(--bg-card)', border: '1px solid var(--bdr)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-0)', fontFamily: 'var(--font-serif)', marginBottom: 6 }}>
                {t('paywall.couple.hook_title')}
              </p>
              <p style={{ fontSize: 12, color: 'var(--tx-2)', lineHeight: 1.6 }}>{t('paywall.couple.hook')}</p>
            </div>
          )}
          <PaywallCard
            mode={mode === 'heming' ? 'couple' : 'single'}
            onPay={(plan) => void payment.openDirectPayment(plan)}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '20px', padding: '20px', maxWidth: '1400px', margin: '0 auto' }} className="chart-workspace-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <ChartBoard
            chart={activeChart ?? chart}
            onStarSelect={handleStarClick}
            onPalaceSelect={handlePalaceClick}
            onSiHuaClick={handleSiHuaBadgeClick}
          />
          {payment.unlocked && (
            <InsightPanel
              chart={activeChart ?? chart}
              selectedPalace={focus?.type === 'palace' || focus?.type === 'star' ? focus.palace : null}
              selectedSiHua={focus?.type === 'sihua' ? { starName: focus.label.split(' ')[0], siHua: focus.siHua, view } : null}
            />
          )}
        </div>
        {payment.unlocked ? (
          <div className="ziwei-chart-chat">
            <ChatPanel chart={activeChart ?? chart} mode={mode} chartData={mode === 'heming' && chart && chartB ? { chartA: chart, chartB } : (activeChart ?? chart)} />
          </div>
        ) : (
          <div className="ziwei-chart-chat" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, background: 'var(--bg-card)', border: '1px solid var(--bdr)',
            borderRadius: 'var(--r-lg)', color: 'var(--tx-3)', fontSize: 13, textAlign: 'center',
          }}>
            {t('paywall.subtitle')}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .chart-workspace-grid { grid-template-columns: 1fr !important; }
          .chart-workspace-grid > div:last-child { height: 480px !important; position: static !important; }
        }
      `}</style>
    </div>
  );
}
