'use client';

import { type ReactNode } from 'react';
import {
  ORASAGE_URLS,
  mainPortalUrl,
  profileUrl,
  isCurrentAppHome,
  isOnPortalHome,
  isOnProfile,
  isOnTemple,
  resolveSecondNavSlot,
  type NavContext,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'var(--shell-gold)' : 'var(--shell-muted)';
  const icons: Record<string, ReactNode> = {
    home: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    ),
    app: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
    blessing: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
        <path d="M12 3v3M8 6l2 2M16 6l-2 2" />
        <path d="M6 10h12v10H6z" />
      </svg>
    ),
    shop: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="18" cy="19" r="1.5" />
      </svg>
    ),
    mine: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  };
  return <>{icons[name] ?? icons.app}</>;
}

export type FixedBottomNavProps = {
  context: NavContext;
  locale?: string;
  pathname?: string;
};

/**
 * 固定底栏 5 键 — 移动端全站
 * 1 首页 · 2 探索/当前应用（动态）· 3 祈福 · 4 商城 · 5 我的
 * 锚点页（首页/祈福/商城/我的）时第 2 键轮换至八字/塔罗/紫微/道藏/名人，避免与固定键重复
 */
export function FixedBottomNav({ context, locale = 'zh-CN', pathname = '/' }: FixedBottomNavProps) {
  const homeHref = mainPortalUrl(locale);
  const slot2 = resolveSecondNavSlot(context, pathname, locale);

  const onPortalHome = context === 'portal' && isOnPortalHome(pathname);
  const onTemple = isOnTemple(pathname);
  const onShop = context === 'shop' && isCurrentAppHome('shop', pathname);
  const onProfile = context === 'portal' && isOnProfile(pathname);

  return (
    <nav className="orasage-app-bottomnav" aria-label="App navigation">
      <div className="orasage-app-bottomnav-inner">
        <a href={homeHref} className="orasage-app-nav-item" data-active={onPortalHome ? 'true' : 'false'}>
          <NavIcon name="home" active={onPortalHome} />
          <span>{pickLabel(SHELL_LABELS.home, locale)}</span>
        </a>

        <a href={slot2.href} className="orasage-app-nav-item" data-active={slot2.active ? 'true' : 'false'}>
          <NavIcon name="app" active={slot2.active} />
          <span className="orasage-app-nav-brand">{slot2.label}</span>
        </a>

        <a href={ORASAGE_URLS.temple} className="orasage-app-nav-item" data-active={onTemple ? 'true' : 'false'}>
          <NavIcon name="blessing" active={onTemple} />
          <span>{pickLabel(SHELL_LABELS.blessing, locale)}</span>
        </a>

        <a href={ORASAGE_URLS.shop} className="orasage-app-nav-item" data-active={onShop ? 'true' : 'false'}>
          <NavIcon name="shop" active={onShop} />
          <span>{pickLabel(SHELL_LABELS.shop, locale)}</span>
        </a>

        <a href={profileUrl(locale)} className="orasage-app-nav-item" data-active={onProfile ? 'true' : 'false'}>
          <NavIcon name="mine" active={onProfile} />
          <span>{pickLabel(SHELL_LABELS.mine, locale)}</span>
        </a>
      </div>
    </nav>
  );
}
