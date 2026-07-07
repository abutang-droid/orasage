'use client';

import { type ReactNode } from 'react';
import { Icon } from '@orasage/ui';
import { appBrandLabel, appHomeUrl, isAppSubpage, type AppId } from './config';
import { SiteTopNav } from './SiteTopNav';
import { pickLabel, SHELL_LABELS } from './labels';
import { FixedBottomNav } from './BottomNav';
import { OrasageAuthChip } from './OrasageAuthChip';
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
  footer?: ReactNode;
  children: ReactNode;
};

/** 子应用外壳：PC 顶栏 + 移动顶栏品牌/登录 + 移动底栏 5 键 */
export function AppShell({
  appId,
  locale = 'zh-CN',
  theme = 'dark',
  pathname = '/',
  showBottomNav = true,
  footer = null,
  children,
}: AppShellProps) {
  const showBack = isAppSubpage(appId, pathname);
  const brandLabel = appBrandLabel(appId, locale);

  return (
    <div className="orasage-app-shell orasage-grain" data-theme={theme} data-app={appId}>
      <SiteTopNav locale={locale} context={appId} />

      <header className="orasage-site-mobile-bar lg:hidden">
        <a href={appHomeUrl(appId)} className="orasage-site-mobile-bar-brand">
          {brandLabel}
        </a>
        <OrasageAuthChip locale={locale} />
      </header>

      <main className={`orasage-app-main orasage-app-main--column${showBottomNav ? '' : ' orasage-app-main--no-bottomnav'}`}>
        {showBack && (
          <div className="orasage-page-toolbar orasage-page-toolbar--subpage lg:hidden">
            <button
              type="button"
              className="orasage-page-back"
              onClick={() => window.history.back()}
              aria-label={pickLabel(SHELL_LABELS.back, locale)}
            >
              <Icon name="chevronLeft" size={18} stroke={1.8} />
              <span>{pickLabel(SHELL_LABELS.back, locale)}</span>
            </button>
          </div>
        )}
        {children}
        {footer}
      </main>

      {showBottomNav && <FixedBottomNav context={appId} locale={locale} pathname={pathname} />}
    </div>
  );
}

export { APP_BRANDS, ORASAGE_URLS, appBrandLabel, type AppId } from './config';
export { FixedBottomNav } from './BottomNav';
export { AppBrandMark } from './AppBrandMark';
export type { NavContext } from './config';
export { isMainPortalHome } from './config';
