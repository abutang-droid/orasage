'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import type { ZiweiChart, Palace, Star } from '@/lib/ziwei/types';
import { BRANCHES } from '@/lib/ziwei/constants';
import PalaceCell from './PalaceCell';
import TimeNav, { type TimeView, getYearStemIndex, buildSiHuaOverlay } from './TimeNav';

export type ChartUiState = {
  selectedBranch: number | null;
  timeView: TimeView;
  liunianYear: number;
};

interface ChartBoardProps {
  chart: ZiweiChart;
  onStarSelect?: (star: Star, palace: Palace) => void;
  onPalaceSelect?: (palace: Palace) => void;
  onSiHuaClick?: (starName: string, siHua: string, view: TimeView) => void;
  uiState?: ChartUiState;
  onUiStateChange?: (next: ChartUiState) => void;
}

const BRANCH_GRID_POS: Record<number, [number, number]> = {
  5: [1, 1], 6: [1, 2], 7: [1, 3], 8: [1, 4],
  4: [2, 1], 9: [2, 4],
  3: [3, 1], 10: [3, 4],
  2: [4, 1], 1: [4, 2], 0: [4, 3], 11: [4, 4],
};

const BRANCH_SVG_POS: Record<number, [number, number]> = {
  5: [12.5, 12.5], 6: [37.5, 12.5], 7: [62.5, 12.5], 8: [87.5, 12.5],
  4: [12.5, 37.5],                                      9: [87.5, 37.5],
  3: [12.5, 62.5],                                     10: [87.5, 62.5],
  2: [12.5, 87.5], 1: [37.5, 87.5], 0: [62.5, 87.5], 11: [87.5, 87.5],
};

const CLOCKWISE_INDEX: Record<number, number> = {
  5: 0, 6: 1, 7: 2, 8: 3, 9: 4, 10: 5, 11: 6, 0: 7, 1: 8, 2: 9, 3: 10, 4: 11,
};

function sortClockwise(branches: number[]): number[] {
  return [...branches].sort((a, b) => CLOCKWISE_INDEX[a] - CLOCKWISE_INDEX[b]);
}

function getSanFangSiZheng(branch: number): [number, number, number, number] {
  return [branch, (branch + 6) % 12, (branch + 4) % 12, (branch + 8) % 12];
}

const ANIMATION_ORDER = [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4];

function defaultUiState(): ChartUiState {
  return {
    selectedBranch: null,
    timeView: 'mingpan',
    liunianYear: new Date().getFullYear(),
  };
}

export default function ChartBoard({
  chart,
  onStarSelect,
  onPalaceSelect,
  onSiHuaClick,
  uiState,
  onUiStateChange,
}: ChartBoardProps) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [localUi, setLocalUi] = useState<ChartUiState>(uiState ?? defaultUiState());

  useEffect(() => {
    if (uiState) setLocalUi(uiState);
  }, [uiState]);

  const selectedBranch = localUi.selectedBranch;
  const timeView = localUi.timeView;
  const liunianYear = localUi.liunianYear;

  const patchUi = (partial: Partial<ChartUiState>) => {
    setLocalUi((prev) => {
      const next = { ...prev, ...partial };
      onUiStateChange?.(next);
      return next;
    });
  };

  const palaceMap: Record<number, Palace> = {};
  chart.palaces.forEach((p) => { palaceMap[p.branch] = p; });

  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const overlayData: Record<string, string> = (() => {
    if (timeView === 'daxian' && currentDx) {
      const dxPalace = chart.palaces.find((p) => p.branch === currentDx.palaceBranch);
      if (dxPalace) return buildSiHuaOverlay(dxPalace.stem);
    }
    if (timeView === 'liunian') return buildSiHuaOverlay(getYearStemIndex(liunianYear));
    return {};
  })();
  const overlayLabel = timeView === 'daxian' ? '限' : timeView === 'liunian' ? '年' : undefined;

  const handlePalaceClick = (branch: number) => {
    const isDeselecting = selectedBranch === branch;
    const nextBranch = isDeselecting ? null : branch;
    patchUi({ selectedBranch: nextBranch });
    if (!isDeselecting) {
      const palace = palaceMap[branch];
      if (palace) onPalaceSelect?.(palace);
    }
  };

  const sanFangBranches = selectedBranch !== null ? getSanFangSiZheng(selectedBranch) : null;
  const sanFangSet = sanFangBranches ? new Set(sanFangBranches) : null;
  const listOrder = sortClockwise(ANIMATION_ORDER);

  const centerBlock = (
    <div className="ziwei-chart-center">
      <div className="ziwei-chart-center-symbol">命</div>
      <div className="ziwei-chart-center-meta">
        <div className="ziwei-chart-center-label">{t('chart.center.title')}</div>
        <div>{t('chart.center.minggong')} {BRANCHES[chart.mingGongBranch]}</div>
        <div>{t('chart.center.shengong')} {BRANCHES[chart.shenGongBranch]}</div>
        <div className="ziwei-chart-center-ju">{chart.wuxingJuName}</div>
      </div>
      {chart.currentDaXianIndex >= 0 ? (() => {
        const dx = chart.daXians[chart.currentDaXianIndex];
        return (
          <div className="ziwei-chart-center-dx">
            <div className="ziwei-chart-center-dx-label">{t('chart.center.currentDaxian')}</div>
            <div className="ziwei-chart-center-dx-age">{dx.startAge}–{dx.endAge}{t('chart.center.years')}</div>
            <div className="ziwei-chart-center-dx-palace">{dx.palaceName}</div>
          </div>
        );
      })() : null}
      <div className="ziwei-chart-center-lunar">
        {chart.lunarInfo.lunarYear}·{chart.lunarInfo.isLeapMonth ? '闰' : ''}{chart.lunarInfo.lunarMonth}·{chart.lunarInfo.lunarDay}
      </div>
    </div>
  );

  const renderPalace = (branch: number, i: number, desktopGrid: boolean) => {
    const palace = palaceMap[branch];
    if (!palace) return null;
    const [row, col] = BRANCH_GRID_POS[branch];
    return (
      <div
        key={branch}
        className="ziwei-chart-grid-cell"
        style={desktopGrid ? { gridRow: row, gridColumn: col } : undefined}
      >
        <PalaceCell
          palace={palace}
          onClick={() => handlePalaceClick(branch)}
          onStarClick={onStarSelect ? (star) => onStarSelect(star, palace) : undefined}
          isSelected={selectedBranch === branch}
          isSanFang={!!(sanFangSet?.has(branch) && selectedBranch !== branch)}
          delay={reduceMotion ? 0 : i * 0.03}
          overlayStarSiHua={Object.keys(overlayData).length > 0 ? overlayData : undefined}
          overlayLabel={overlayLabel}
          onSiHuaClick={onSiHuaClick ? (starName, siHua) => onSiHuaClick(starName, siHua, timeView) : undefined}
        />
      </div>
    );
  };

  return (
    <div className="w-full ziwei-chart-board">
      <TimeNav
        chart={chart}
        view={timeView}
        liunianYear={liunianYear}
        onViewChange={(view) => patchUi({ timeView: view })}
        onYearChange={(year) => patchUi({ liunianYear: year, timeView: 'liunian' })}
      />
      <div className="ziwei-chart-heading">
        <div className="ziwei-chart-heading-en">Zi Wei Dou Shu</div>
        <h2 className="ziwei-chart-heading-title">
          {chart.birthInfo.name ? `${chart.birthInfo.name} · ` : ''}紫微斗数命盘
        </h2>
      </div>

      {/* Desktop 4×4 */}
      <div className="ziwei-chart-grid ziwei-chart-grid--desktop">
        {ANIMATION_ORDER.map((branch, i) => renderPalace(branch, i, true))}
        <div className="ziwei-chart-center-wrap" style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}>
          {centerBlock}
        </div>
        <AnimatePresence>
          {sanFangBranches !== null ? (
            <motion.div
              key={`sf-${selectedBranch}`}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
              className="ziwei-chart-sanfang-overlay pointer-events-none"
              aria-hidden
            >
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                {(() => {
                  const p0 = BRANCH_SVG_POS[sanFangBranches[0]];
                  const p1 = BRANCH_SVG_POS[sanFangBranches[1]];
                  const p2 = BRANCH_SVG_POS[sanFangBranches[2]];
                  const p3 = BRANCH_SVG_POS[sanFangBranches[3]];
                  const stroke = 'var(--os-color-mono-gray-deep, #6b7280)';
                  return (
                    <>
                      <line x1={`${p0[0]}%`} y1={`${p0[1]}%`} x2={`${p1[0]}%`} y2={`${p1[1]}%`} stroke={stroke} strokeWidth="1.2" strokeDasharray="4,4" />
                      <line x1={`${p0[0]}%`} y1={`${p0[1]}%`} x2={`${p2[0]}%`} y2={`${p2[1]}%`} stroke={stroke} strokeWidth="1.2" strokeDasharray="4,4" />
                      <line x1={`${p2[0]}%`} y1={`${p2[1]}%`} x2={`${p3[0]}%`} y2={`${p3[1]}%`} stroke={stroke} strokeWidth="1.2" strokeDasharray="4,4" />
                      <line x1={`${p3[0]}%`} y1={`${p3[1]}%`} x2={`${p0[0]}%`} y2={`${p0[1]}%`} stroke={stroke} strokeWidth="1.2" strokeDasharray="4,4" />
                    </>
                  );
                })()}
              </svg>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Mobile: center first, then 2-col clockwise list */}
      <div className="ziwei-chart-mobile">
        <div className="ziwei-chart-mobile-center">{centerBlock}</div>
        <div className="ziwei-chart-mobile-grid">
          {listOrder.map((branch, i) => renderPalace(branch, i, false))}
        </div>
      </div>

      <div className="ziwei-chart-legend">
        {['禄', '权', '科', '忌'].map((h) => (
          <span key={h} className={`ziwei-sihua-legend ziwei-sihua-${h}`}>化{h}</span>
        ))}
        <span className="ziwei-sihua-legend is-muted">{t('chart.legend.sihua')}</span>
      </div>
    </div>
  );
}
