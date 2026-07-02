'use client';

import { useState, type ReactNode } from 'react';
import {
  APP_BRANDS,
  ORASAGE_URLS,
  appHomeUrl,
  isAppSubpage,
  type AppId,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import { FixedBottomNav } from './BottomNav';
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
  /** 固定底栏（命理 App 全页显示；默认 true） */
  showBottomNav?: boolean;
  children: ReactNode;
};

export function AppShell({
  appId,
  locale = 'zh-CN',
  locales = [],
  onLocaleChange,
  theme = 'dark',
  pathname = '/',
  showBottomNav = true,
  children,
}: AppShellProps) {
  const [langOpen, setLangOpen] = useState(false);
  const brand = APP_BRANDS[appId];
  const currentLocaleLabel = locales.find((l) => l.code === locale)?.label ?? locale;
  const showBack = isAppSubpage(appId, pathname);

  return (
    <div className="orasage-app-shell orasage-grain" data-theme={theme}>
      <header className="orasage-app-topbar">
        <div className="orasage-app-topbar-start">
          {showBack ? (
            <a href={appHomeUrl(appId)} className="orasage-app-back" aria-label={pickLabel(SHELL_LABELS.back, locale)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>{pickLabel(SHELL_LABELS.back, locale)}</span>
            </a>
          ) : (
            <a href={appHomeUrl(appId)} className="orasage-app-brand">
              {brand}
            </a>
          )}
        </div>
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

      <main className={`orasage-app-main${showBottomNav ? '' : ' orasage-app-main--no-bottomnav'}`}>{children}</main>

      {showBottomNav && <FixedBottomNav context={appId} locale={locale} pathname={pathname} />}
    </div>
  );
}

export { APP_BRANDS, ORASAGE_URLS, type AppId } from './config';
export { FixedBottomNav } from './BottomNav';
export type { NavContext } from './config';
export { isMainPortalHome } from './config';
