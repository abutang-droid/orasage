import type { ReactNode } from 'react';
import { APP_BRANDS, type AppId } from './config';

const MARKS: Record<AppId, ReactNode> = {
  bazi: (
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" aria-hidden>
      <circle cx="50" cy="50" r="46" stroke="var(--shell-gold)" strokeWidth="1.5" opacity="0.45" />
      <path d="M50 4 A46 46 0 0 1 50 96 A23 23 0 0 1 50 50 A23 23 0 0 0 50 4Z" fill="var(--shell-gold)" opacity="0.08" />
      <circle cx="50" cy="27" r="4" fill="var(--shell-gold)" opacity="0.55" />
    </svg>
  ),
  ziwei: (
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" aria-hidden>
      <circle cx="50" cy="50" r="44" stroke="var(--shell-gold)" strokeWidth="1.2" opacity="0.5" />
      <path d="M50 8 L58 42 L92 50 L58 58 L50 92 L42 58 L8 50 L42 42 Z" fill="var(--shell-gold)" fillOpacity="0.12" stroke="var(--shell-gold)" strokeWidth="0.8" opacity="0.35" />
    </svg>
  ),
  tarot: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v3M8 6l2 2M16 6l-2 2" stroke="var(--shell-gold)" strokeWidth="1.4" opacity="0.6" />
      <path d="M6 10h12v10H6z" stroke="var(--shell-gold)" strokeWidth="1.4" fill="var(--shell-gold)" fillOpacity="0.08" />
    </svg>
  ),
};

/** 应用首页左上角品牌图形（非固定顶栏） */
export function AppBrandMark({ appId }: { appId: AppId }) {
  return (
    <div className="orasage-app-brand-mark" aria-label={APP_BRANDS[appId]}>
      {MARKS[appId]}
      <span className="orasage-app-brand-mark-label">{APP_BRANDS[appId]}</span>
    </div>
  );
}
