'use client';

import { useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  APP_BRANDS,
  ORASAGE_URLS,
  appHomeUrl,
  exploreItems,
  profileUrl,
  isCurrentAppHome,
  type AppId,
  type NavContext,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? 'var(--shell-gold)' : 'var(--shell-muted)';
  const icons: Record<string, ReactNode> = {
    app: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    ),
    explore: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
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

/** 固定底栏 — 除 Main 门户首页外全站使用 */
export function FixedBottomNav({ context, locale = 'zh-CN', pathname = '/' }: FixedBottomNavProps) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const closeExplore = useCallback(() => setExploreOpen(false), []);

  useEffect(() => {
    if (!exploreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExplore();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exploreOpen, closeExplore]);

  const isPortal = context === 'portal';
  const appId = isPortal ? null : context;
  const brand = isPortal ? 'OraSage' : APP_BRANDS[appId as AppId];
  const homeHref = isPortal ? `${ORASAGE_URLS.main}/${locale}` : appHomeUrl(appId as AppId);
  const onAppHome = isPortal
    ? pathname === '/' || pathname === ''
    : isCurrentAppHome(appId as AppId, pathname);
  const onTemple = appId === 'tarot' && (pathname === '/temple' || pathname.startsWith('/temple/'));

  return (
    <>
      <nav className="orasage-app-bottomnav" aria-label="App navigation">
        <div className="orasage-app-bottomnav-inner">
          <a href={homeHref} className="orasage-app-nav-item" data-active={onAppHome ? 'true' : 'false'}>
            <NavIcon name="app" active={onAppHome} />
            <span className="orasage-app-nav-brand">{brand}</span>
          </a>

          <button
            type="button"
            className="orasage-app-nav-item"
            data-active={exploreOpen ? 'true' : 'false'}
            onClick={() => setExploreOpen(true)}
          >
            <NavIcon name="explore" active={exploreOpen} />
            <span>{pickLabel(SHELL_LABELS.explore, locale)}</span>
          </button>

          <a
            href={appId === 'tarot' ? '/temple' : ORASAGE_URLS.temple}
            className="orasage-app-nav-item"
            data-active={onTemple ? 'true' : 'false'}
          >
            <NavIcon name="blessing" active={onTemple} />
            <span>{pickLabel(SHELL_LABELS.blessing, locale)}</span>
          </a>

          <a href={ORASAGE_URLS.shop} className="orasage-app-nav-item" data-active="false">
            <NavIcon name="shop" active={false} />
            <span>{pickLabel(SHELL_LABELS.shop, locale)}</span>
          </a>

          <a href={profileUrl(locale)} className="orasage-app-nav-item" data-active="false">
            <NavIcon name="mine" active={false} />
            <span>{pickLabel(SHELL_LABELS.mine, locale)}</span>
          </a>
        </div>
      </nav>

      {exploreOpen && (
        <>
          <button
            type="button"
            className="orasage-app-explore-backdrop"
            aria-label="Close"
            onClick={closeExplore}
          />
          <div className="orasage-app-explore-sheet" role="dialog" aria-modal="true">
            <h2 className="orasage-app-explore-title">{pickLabel(SHELL_LABELS.exploreTitle, locale)}</h2>
            <div className="orasage-app-explore-list">
              {exploreItems(locale).map((item) => (
                <a key={item.id} href={item.href} className="orasage-app-explore-link" onClick={closeExplore}>
                  {item.labels[locale] ?? item.labels['zh-CN'] ?? item.labels.en}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
