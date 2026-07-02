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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--tx-3)', letterSpacing: '0.08em', flexShrink: 0 }}>
          {t('form.person.editing')}
        </span>
      </div>
      <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--bdr)', borderRadius: 'var(--r-lg)', padding: '4px', gap: '4px' }}>
        {personLabels.map((label, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActivePerson(idx as 0 | 1)}
            style={{
              flex: 1,
              height: '40px',
              borderRadius: 'var(--r-md)',
              border: 'none',
              background: activePerson === idx ? 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)' : 'transparent',
              color: activePerson === idx ? '#FFFFFF' : 'var(--tx-2)',
              fontSize: '13px',
              fontWeight: activePerson === idx ? 700 : 400,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--bdr)', padding: '24px' }}>
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
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        style={{
          width: '100%', height: '52px',
          background: canSubmit && !loading ? 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)' : 'var(--bdr-med)',
          color: canSubmit && !loading ? '#FFFFFF' : 'var(--tx-3)',
          border: 'none', borderRadius: 'var(--r-md)', fontSize: '15px', fontWeight: 700,
          cursor: canSubmit && !loading ? 'pointer' : 'not-allowed', letterSpacing: '0.15em',
        }}
      >
        {loading ? t('heming.submit.loading') : t('heming.submit')}
      </button>
    </div>
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
      <div style={{ background: 'var(--bg-0)', padding: '24px 0 16px' }} className="orasage-fade-in">
        <div style={{ maxWidth: '480px', margin: '0 auto 24px', padding: '0 20px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--bdr)', borderRadius: 'var(--r-lg)', padding: '4px', gap: '4px' }}>
            {(['single', 'heming'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex: 1, height: '40px', borderRadius: 'var(--r-md)', border: 'none', background: mode === m ? 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)' : 'transparent', color: mode === m ? '#FFFFFF' : 'var(--tx-2)', fontSize: '13px', fontWeight: mode === m ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em' }}>
                {m === 'single' ? t('tab.single') : t('tab.heming')}
              </button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
          {mode === 'single' ? (
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--bdr)', padding: '24px' }}>
              <BirthForm key={formKey} onSubmit={handleSingleSubmit} loading={loading} initialData={savedForm ?? undefined}
                onFormSave={form => { setSavedForm(form); if (form.year && form.month && form.day) { saveHistory(form); const params = formToSearchParams(form); if (typeof window !== 'undefined') window.history.replaceState({}, '', `/chart?${params.toString()}`); } }} />
            </div>
          ) : (
            <HemingPanel onSubmit={handleHemingSubmit} loading={loading} />
          )}
          {error && <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(168,50,40,0.06)', border: '1px solid rgba(168,50,40,0.2)', borderRadius: 'var(--r-md)', fontSize: '12px', color: '#c0392b', textAlign: 'center' }}>{error}</div>}
          {mode === 'single' && history.length > 0 && (
            <div style={{ marginTop: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.4em', color: 'var(--tx-3)' }}>{t('form.history')}</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--bdr)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {history.map(entry => (
                  <div key={entry.id} onClick={() => { setSavedForm(entry.form); handleSingleSubmit(formToBirthInfo(entry.form), entry.form); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--bdr)', borderRadius: 'var(--r-md)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'; }}>
                    <span style={{ fontSize: '11px', color: 'var(--gold)', opacity: 0.5, flexShrink: 0 }}>✦</span>
                    <span style={{ fontSize: '12px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--tx-2)' }}>{entry.label}</span>
                    <button onClick={e => { e.stopPropagation(); removeHistory(entry.id); }} style={{ fontSize: '16px', color: 'var(--tx-3)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, opacity: 0.5, flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
