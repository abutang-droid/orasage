'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  APP_BRANDS,
  APP_HOME_PATH,
  ORASAGE_URLS,
  appHomeUrl,
  exploreItems,
  profileUrl,
  type AppId,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import './app-shell.css';

export type LocaleOption = { code: string; label: string };

export type AppShellProps = {
  appId: AppId;
  locale?: string;
  locales?: LocaleOption[];
  onLocaleChange?: (code: string) => void;
  theme?: 'light' | 'dark';
  /** 当前路径，用于高亮底栏「当前应用」 */
  pathname?: string;
  children: ReactNode;
};

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

function isCurrentAppHome(appId: AppId, pathname: string): boolean {
  const home = APP_HOME_PATH[appId];
  if (home === '/') return pathname === '/' || pathname === '';
  return pathname === home || pathname.startsWith(`${home}/`);
}

export function AppShell({
  appId,
  locale = 'zh-CN',
  locales = [],
  onLocaleChange,
  theme = 'dark',
  pathname = '/',
  children,
}: AppShellProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const brand = APP_BRANDS[appId];
  const currentLocaleLabel = locales.find((l) => l.code === locale)?.label ?? locale;

  const closeExplore = useCallback(() => setExploreOpen(false), []);

  useEffect(() => {
    if (!exploreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExplore();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exploreOpen, closeExplore]);

  const onAppHome = isCurrentAppHome(appId, pathname);
  const onTemple = appId === 'tarot' && (pathname === '/temple' || pathname.startsWith('/temple/'));

  return (
    <div className="orasage-app-shell" data-theme={theme}>
      <header className="orasage-app-topbar">
        <a href={appHomeUrl(appId)} className="orasage-app-brand">
          {brand}
        </a>
        {locales.length > 0 && onLocaleChange && (
          <div className="orasage-app-lang">
            <button
              type="button"
              className="orasage-app-lang-btn"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
            >
              {currentLocaleLabel}
            </button>
            {langOpen && (
              <div className="orasage-app-lang-menu" role="menu">
                {locales.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    role="menuitem"
                    className="orasage-app-lang-item"
                    aria-current={loc.code === locale ? 'true' : undefined}
                    onClick={() => {
                      onLocaleChange(loc.code);
                      setLangOpen(false);
                    }}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      <main className="orasage-app-main">{children}</main>

      <nav className="orasage-app-bottomnav" aria-label="App navigation">
        <div className="orasage-app-bottomnav-inner">
          <a
            href={appHomeUrl(appId)}
            className="orasage-app-nav-item"
            data-active={onAppHome ? 'true' : 'false'}
          >
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

          <a
            href={ORASAGE_URLS.shop}
            className="orasage-app-nav-item"
            data-active="false"
          >
            <NavIcon name="shop" active={false} />
            <span>{pickLabel(SHELL_LABELS.shop, locale)}</span>
          </a>

          <a
            href={profileUrl(locale)}
            className="orasage-app-nav-item"
            data-active="false"
          >
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
            <h2 className="orasage-app-explore-title">
              {pickLabel(SHELL_LABELS.exploreTitle, locale)}
            </h2>
            <div className="orasage-app-explore-list">
              {exploreItems(locale).map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="orasage-app-explore-link"
                  onClick={closeExplore}
                >
                  {item.labels[locale] ?? item.labels['zh-CN'] ?? item.labels.en}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { APP_BRANDS, ORASAGE_URLS, type AppId } from './config';
