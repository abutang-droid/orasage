'use client';
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@orasage/ui/button';
import { STEMS, SI_HUA_TABLE } from '@/lib/ziwei/constants';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { useT } from '@/lib/i18n';

export type TimeView = 'mingpan' | 'daxian' | 'liunian';

interface TimeNavProps {
  chart: ZiweiChart; view: TimeView; liunianYear: number;
  onViewChange: (view: TimeView) => void; onYearChange: (year: number) => void;
}

export function getYearStemIndex(year: number): number { return ((year - 4) % 10 + 10) % 10; }

export function buildSiHuaOverlay(stemIndex: number): Record<string, string> {
  const stars = SI_HUA_TABLE[stemIndex];
  if (!stars) return {};
  return { [stars[0]]: '禄', [stars[1]]: '权', [stars[2]]: '科', [stars[3]]: '忌' };
}

const SIHUA_COLORS: Record<string, string> = { '禄': '#4ade80', '权': '#60a5fa', '科': '#facc15', '忌': '#f87171' };

const tabButtonClass = 'h-auto min-h-0 flex-1 rounded-lg py-1.5 text-[10px] font-medium';

function tabButtonStyle(active: boolean): CSSProperties {
  return {
    background: active ? 'rgba(212,168,67,0.12)' : 'transparent',
    color: active ? 'var(--t-gold)' : 'var(--t-faint)',
    borderColor: active ? 'rgba(212,168,67,0.25)' : 'transparent',
  };
}

export default function TimeNav({ chart, view, liunianYear, onViewChange, onYearChange }: TimeNavProps) {
  const t = useT();
  const currentDx = chart.daXians[chart.currentDaXianIndex];

  const getOverlayInfo = (): { stemName: string; overlay: Record<string, string> } | null => {
    if (view === 'mingpan') return null;
    if (view === 'daxian' && currentDx) {
      const dxPalace = chart.palaces.find(p => p.branch === currentDx.palaceBranch);
      if (!dxPalace) return null;
      return { stemName: STEMS[dxPalace.stem], overlay: buildSiHuaOverlay(dxPalace.stem) };
    }
    if (view === 'liunian') return { stemName: STEMS[getYearStemIndex(liunianYear)], overlay: buildSiHuaOverlay(getYearStemIndex(liunianYear)) };
    return null;
  };

  const overlayInfo = getOverlayInfo();
  const liunianActive = view === 'liunian';

  return (<div className="mb-3">
    <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}>
      <TabButton active={view === 'mingpan'} onClick={() => onViewChange('mingpan')}>{t('timenav.mingpan')}</TabButton>
      <TabButton active={view === 'daxian'} onClick={() => onViewChange('daxian')}>{currentDx ? `${t('timenav.daxian')} ${currentDx.startAge}–${currentDx.endAge}` : t('timenav.daxian')}</TabButton>
      <div
        className="relative flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 transition-all duration-200"
        style={{
          background: liunianActive ? 'rgba(212,168,67,0.12)' : 'transparent',
          border: liunianActive ? '1px solid rgba(212,168,67,0.25)' : '1px solid transparent',
        }}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={() => onViewChange('liunian')}
          className={`${tabButtonClass} flex-1 text-center font-medium`}
          style={{ color: liunianActive ? 'var(--t-gold)' : 'var(--t-faint)' }}
        >
          {t('timenav.liunian')}
        </Button>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onYearChange(liunianYear - 1); if (view !== 'liunian') onViewChange('liunian'); }}
            className="size-4 min-h-0 min-w-4 rounded text-[9px] text-[var(--t-faint)]"
          >
            ‹
          </Button>
          <span
            className="min-w-[28px] cursor-pointer text-center font-mono text-[10px]"
            style={{ color: liunianActive ? 'var(--t-gold)' : 'var(--t-faint)' }}
            onClick={() => onViewChange('liunian')}
          >
            {liunianYear}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onYearChange(liunianYear + 1); if (view !== 'liunian') onViewChange('liunian'); }}
            className="size-4 min-h-0 min-w-4 rounded text-[9px] text-[var(--t-faint)]"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
    {overlayInfo && (<motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 mt-1.5 px-1 flex-wrap">
      <span className="text-[9px]" style={{ color: 'var(--t-faint)' }}>{view === 'daxian' ? t('timenav.sihua.prefix.daxian') : String(liunianYear)}·{overlayInfo.stemName}{t('timenav.sihua.prefix.liunian')}四化：</span>
      {(['禄', '权', '科', '忌'] as const).map(sh => {
        const starName = Object.keys(overlayInfo.overlay).find(k => overlayInfo.overlay[k] === sh);
        if (!starName) return null;
        return <span key={sh} className="text-[9px] font-medium" style={{ color: SIHUA_COLORS[sh] }}>{starName}化{sh}</span>;
      })}
    </motion.div>)}
  </div>);
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={tabButtonClass}
      style={tabButtonStyle(active)}
    >
      {children}
    </Button>
  );
}
