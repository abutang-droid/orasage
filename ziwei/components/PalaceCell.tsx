'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import type { Palace, Star } from '@/lib/ziwei/types';
import { STEMS, BRANCHES } from '@/lib/ziwei/constants';
import clsx from 'clsx';
import type { KeyboardEvent } from 'react';

interface PalaceCellProps {
  palace: Palace; onClick?: () => void; onStarClick?: (star: Star) => void;
  isSelected?: boolean; isSanFang?: boolean; delay?: number;
  overlayStarSiHua?: Record<string, string>; overlayLabel?: string;
  onSiHuaClick?: (starName: string, siHua: string) => void;
}

const SiHuaBadge = ({ siHua, overlay, label, onClick }: { siHua: string; overlay?: boolean; label?: string; onClick?: (e: React.MouseEvent) => void }) => (
  <span
    className={clsx('ziwei-sihua-badge', `ziwei-sihua-${siHua}`, overlay && 'is-overlay', onClick && 'is-clickable')}
    onClick={onClick}
  >
    {overlay && label ? <span className="ziwei-sihua-overlay-label">{label}</span> : null}
    {siHua}
  </span>
);

export default function PalaceCell({ palace, onClick, onStarClick, isSelected, isSanFang, delay = 0, overlayStarSiHua, overlayLabel, onSiHuaClick }: PalaceCellProps) {
  const t = useT();
  const reduceMotion = useReducedMotion();
  const { branch, stem, name, stars, daXianAge, isCurrentDaXian, isMingGong, isShenGong } = palace;
  const ganzhi = `${STEMS[stem]}${BRANCHES[branch]}`;
  const majorStars = stars.filter(s => s.type === 'major');
  const luckyStars = stars.filter(s => s.type === 'lucky');
  const shaStars = stars.filter(s => s.type === 'sha');

  const statusBits = [
    isSelected ? t('chart.palace.selected') : '',
    isSanFang ? t('chart.palace.sanfang') : '',
    isMingGong ? t('chart.palace.ming') : '',
    isShenGong ? t('chart.palace.shen') : '',
    isCurrentDaXian ? t('chart.palace.daxian') : '',
  ].filter(Boolean);
  const ariaLabel = [name, ganzhi, ...statusBits].join(' · ');

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.25, delay, ease: 'easeOut' }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? Boolean(isSelected) : undefined}
      aria-label={onClick ? ariaLabel : undefined}
      className={clsx(
        'ziwei-palace-cell',
        isCurrentDaXian && 'is-daxian',
        isSelected && 'is-selected',
        isSanFang && 'is-sanfang',
        isMingGong && 'is-ming',
        isShenGong && 'is-shen',
      )}
    >
      {daXianAge ? (
        <div className="ziwei-palace-daxian-age">{daXianAge[0]}–{daXianAge[1]}</div>
      ) : null}
      <div className="ziwei-palace-head">
        <span className="ziwei-palace-name">{name}</span>
        {isMingGong ? <span className="ziwei-palace-tag">命</span> : null}
        {isShenGong ? <span className="ziwei-palace-tag is-shen">身</span> : null}
      </div>
      <div className="ziwei-palace-ganzhi">{ganzhi}</div>
      <div className="ziwei-palace-stars">
        {majorStars.length === 0 ? (
          <span className="ziwei-palace-empty">{t('chart.empty.palace')}</span>
        ) : null}
        {majorStars.map((star) => {
          const overlaySiHua = overlayStarSiHua?.[star.name];
          return (
            <div
              key={star.name}
              className="ziwei-palace-major-row"
              onClick={onStarClick ? (e) => { e.stopPropagation(); onStarClick(star); } : undefined}
            >
              <span className={clsx('ziwei-star-major', star.brightness === 'bright' && 'is-bright', star.brightness === 'dim' && 'is-dim')}>
                {star.name}
              </span>
              {star.siHua ? <SiHuaBadge siHua={star.siHua} /> : null}
              {overlaySiHua ? (
                <SiHuaBadge
                  siHua={overlaySiHua}
                  overlay
                  label={overlayLabel}
                  onClick={onSiHuaClick ? (e) => { e.stopPropagation(); onSiHuaClick(star.name, overlaySiHua); } : undefined}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {luckyStars.length > 0 ? (
        <div className="ziwei-palace-minor-row">
          {luckyStars.map((s) => {
            const overlaySiHua = overlayStarSiHua?.[s.name];
            return (
              <span key={s.name} className="ziwei-star-minor is-lucky">
                {s.name}
                {s.siHua ? <SiHuaBadge siHua={s.siHua} /> : null}
                {overlaySiHua ? (
                  <SiHuaBadge
                    siHua={overlaySiHua}
                    overlay
                    label={overlayLabel}
                    onClick={onSiHuaClick ? (e) => { e.stopPropagation(); onSiHuaClick(s.name, overlaySiHua); } : undefined}
                  />
                ) : null}
              </span>
            );
          })}
        </div>
      ) : null}
      {shaStars.length > 0 ? (
        <div className="ziwei-palace-minor-row">
          {shaStars.map((s) => (
            <span key={s.name} className="ziwei-star-minor is-sha">{s.name}</span>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
