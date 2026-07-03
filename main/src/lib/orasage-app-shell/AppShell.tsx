'use client';

import { type ReactNode } from 'react';
import { isAppSubpage, type AppId } from './config';
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
  pathname?: string;
  showBottomNav?: boolean;
  children: ReactNode;
};

/** 命理 App 外壳：仅固定底栏，顶栏不固定；子页右上角返回 */
export function AppShell({
  appId,
  locale = 'zh-CN',
  theme = 'dark',
  pathname = '/',
  showBottomNav = true,
  children,
}: AppShellProps) {
  const showBack = isAppSubpage(appId, pathname);

  return (
    <div className="orasage-app-shell orasage-grain" data-theme={theme}>
      <main className={`orasage-app-main${showBottomNav ? '' : ' orasage-app-main--no-bottomnav'}`}>
        {showBack && (
          <div className="orasage-page-toolbar">
            <button
              type="button"
              className="orasage-page-back"
              onClick={() => window.history.back()}
              aria-label={pickLabel(SHELL_LABELS.back, locale)}
            >
              <svg className="rtl:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>{pickLabel(SHELL_LABELS.back, locale)}</span>
            </button>
          </div>
        )}
        {children}
      </main>

      {showBottomNav && <FixedBottomNav context={appId} locale={locale} pathname={pathname} />}
    </div>
  );
}

export { APP_BRANDS, ORASAGE_URLS, type AppId } from './config';
export { FixedBottomNav } from './BottomNav';
export { AppBrandMark } from './AppBrandMark';
export type { NavContext } from './config';
export { isMainPortalHome } from './config';
