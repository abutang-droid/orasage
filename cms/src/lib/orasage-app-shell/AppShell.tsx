'use client';

import { ChevronLeft } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@orasage/ui/button';
import { appBrandLabel, appHomeUrl, isAppSubpage, type AppId } from './config';
import { SiteTopNav } from './SiteTopNav';
import { pickLabel, SHELL_LABELS } from './labels';
import { FixedBottomNav } from './BottomNav';
import { OrasageAuthChip } from './OrasageAuthChip';
import { LocaleSwitcher } from './LocaleSwitcher';
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
  showMobileBar?: boolean;
  showSiteTopNav?: boolean;
  immersive?: boolean;
  showLocaleSwitcher?: boolean;
  footer?: ReactNode;
  /** 顶栏右侧插槽（PC 导航尾、移动顶栏登录旁），如 shop 购物车 */
  headerExtra?: ReactNode;
  children: ReactNode;
};

/** 子应用外壳：PC 顶栏 + 移动顶栏品牌/登录 + 移动底栏 5 键 */
export function AppShell({
  appId,
  locale = 'zh-CN',
  theme = 'dark',
  pathname = '/',
  showBottomNav = true,
  showMobileBar = true,
  showSiteTopNav = true,
  immersive = false,
  showLocaleSwitcher = true,
  footer = null,
  headerExtra = null,
  onLocaleChange,
  children,
}: AppShellProps) {
  const showBack = isAppSubpage(appId, pathname) && !immersive;
  const brandLabel = appBrandLabel(appId, locale);

  return (
    <div className="orasage-app-shell orasage-grain" data-theme={theme} data-app={appId}>
      {showSiteTopNav && (
        <SiteTopNav
          locale={locale}
          context={appId}
          trailing={headerExtra}
          showLocaleSwitcher={showLocaleSwitcher}
          onLocaleChange={onLocaleChange}
        />
      )}

      {showMobileBar && (
        <header className="orasage-site-mobile-bar lg:hidden">
          <a href={appHomeUrl(appId)} className="orasage-site-mobile-bar-brand">
            {brandLabel}
          </a>
          <div className="orasage-site-mobile-bar-actions">
            {headerExtra}
            {showLocaleSwitcher && (
              <LocaleSwitcher locale={locale} context={appId} onLocaleChange={onLocaleChange} />
            )}
            <OrasageAuthChip locale={locale} />
          </div>
        </header>
      )}

      <main className={`orasage-app-main orasage-app-main--column${showBottomNav ? '' : ' orasage-app-main--no-bottomnav'}${immersive ? ' orasage-app-main--immersive' : ''}`}>
        {showBack && (
          <div className="orasage-page-toolbar orasage-page-toolbar--subpage lg:hidden">
            <Button
              type="button"
              variant="ghost"
              className="orasage-page-back h-auto min-h-0 border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
              onClick={() => window.history.back()}
              aria-label={pickLabel(SHELL_LABELS.back, locale)}
            >
              <ChevronLeft size={18} strokeWidth={1.8} aria-hidden />
              <span>{pickLabel(SHELL_LABELS.back, locale)}</span>
            </Button>
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
