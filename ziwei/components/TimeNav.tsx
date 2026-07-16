'use client';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

const SIHUA_CLASS: Record<string, string> = {
  '禄': 'ziwei-sihua-legend ziwei-sihua-禄',
  '权': 'ziwei-sihua-legend ziwei-sihua-权',
  '科': 'ziwei-sihua-legend ziwei-sihua-科',
  '忌': 'ziwei-sihua-legend ziwei-sihua-忌',
};

export default function TimeNav({ chart, view, liunianYear, onViewChange, onYearChange }: TimeNavProps) {
  const t = useT();
  const reduceMotion = useReducedMotion();
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

  return (
    <div className="ziwei-timenav mb-3">
      <div
        className="ziwei-timenav-tabs flex items-center rounded-xl p-1 gap-1"
        role="tablist"
        aria-label={t('timenav.views')}
      >
        <TabButton
          active={view === 'mingpan'}
          onClick={() => onViewChange('mingpan')}
        >
          {t('timenav.mingpan')}
        </TabButton>
        <TabButton
          active={view === 'daxian'}
          onClick={() => onViewChange('daxian')}
        >
          {currentDx ? `${t('timenav.daxian')} ${currentDx.startAge}–${currentDx.endAge}` : t('timenav.daxian')}
        </TabButton>
        <div
          className={`ziwei-timenav-liunian relative flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5${liunianActive ? ' is-active' : ''}`}
          role="presentation"
        >
          <Button
            type="button"
            role="tab"
            aria-selected={liunianActive}
            variant="ghost"
            onClick={() => onViewChange('liunian')}
            className="ziwei-timenav-tab h-auto min-h-11 flex-1 text-center font-medium text-xs"
          >
            {t('timenav.liunian')}
          </Button>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('timenav.year.prev', { year: liunianYear - 1 })}
              onClick={(e) => { e.stopPropagation(); onYearChange(liunianYear - 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="ziwei-timenav-year-btn size-11 min-h-11 min-w-11 rounded text-sm"
            >
              ‹
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label={t('timenav.year.select', { year: liunianYear })}
              aria-pressed={liunianActive}
              onClick={() => onViewChange('liunian')}
              className="ziwei-timenav-year h-auto min-h-11 min-w-[2.75rem] px-1 font-mono text-xs"
            >
              {liunianYear}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('timenav.year.next', { year: liunianYear + 1 })}
              onClick={(e) => { e.stopPropagation(); onYearChange(liunianYear + 1); if (view !== 'liunian') onViewChange('liunian'); }}
              className="ziwei-timenav-year-btn size-11 min-h-11 min-w-11 rounded text-sm"
            >
              ›
            </Button>
          </div>
        </div>
      </div>
      {overlayInfo ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
          className="ziwei-timenav-sihua flex items-center gap-2 mt-1.5 px-1 flex-wrap"
        >
          <span className="text-xs text-[var(--os-color-mono-gray-deep,#6b7280)]">
            {view === 'daxian' ? t('timenav.sihua.prefix.daxian') : String(liunianYear)}·{overlayInfo.stemName}{t('timenav.sihua.prefix.liunian')}四化：
          </span>
          {(['禄', '权', '科', '忌'] as const).map((sh) => {
            const starName = Object.keys(overlayInfo.overlay).find((k) => overlayInfo.overlay[k] === sh);
            if (!starName) return null;
            return (
              <span key={sh} className={`${SIHUA_CLASS[sh]} text-xs font-medium`}>
                {starName}化{sh}
              </span>
            );
          })}
        </motion.div>
      ) : null}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button
      type="button"
      role="tab"
      aria-selected={active}
      variant="outline"
      onClick={onClick}
      className={`ziwei-timenav-tab h-auto min-h-11 flex-1 rounded-lg py-1.5 text-xs font-medium${active ? ' is-active' : ''}`}
    >
      {children}
    </Button>
  );
}
