import type { ReactNode } from 'react';
import { APP_BRANDS, type AppId } from './config';

/**
 * 子品牌图形 — 统一网格（VI v1.0 §5.2）：
 * 外环 r22 / 描边 3；内芯描边 2.4，可用 8–12% 透明度填充。
 * canonical SVG 源见 shared/brand/subbrands/。
 */
const MARKS: Record<AppId, ReactNode> = {
  bazi: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="22" stroke="var(--shell-gold)" strokeWidth="3" />
      <path d="M32 10 A22 22 0 0 1 32 54 A11 11 0 0 1 32 32 A11 11 0 0 0 32 10 Z" fill="var(--shell-gold)" fillOpacity="0.12" />
      <circle cx="32" cy="21" r="3" fill="var(--shell-gold)" />
    </svg>
  ),
  ziwei: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="22" stroke="var(--shell-gold)" strokeWidth="3" />
      <path d="M32 14 L35.4 28.6 L50 32 L35.4 35.4 L32 50 L28.6 35.4 L14 32 L28.6 28.6 Z" fill="var(--shell-gold)" fillOpacity="0.12" stroke="var(--shell-gold)" strokeWidth="1.6" />
    </svg>
  ),
  tarot: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="22" stroke="var(--shell-gold)" strokeWidth="3" />
      <rect x="24" y="22" width="16" height="22" rx="2" stroke="var(--shell-gold)" strokeWidth="2.4" fill="var(--shell-gold)" fillOpacity="0.08" />
      <circle cx="32" cy="33" r="2.4" fill="var(--shell-gold)" />
    </svg>
  ),
  shop: (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="22" stroke="var(--shell-gold)" strokeWidth="3" />
      <path d="M32 20 L38 26 L38 42 L26 42 L26 26 Z" stroke="var(--shell-gold)" strokeWidth="2.4" fill="var(--shell-gold)" fillOpacity="0.08" />
      <path d="M29 26 a3 3 0 0 1 6 0" stroke="var(--shell-gold)" strokeWidth="2.4" fill="none" />
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
