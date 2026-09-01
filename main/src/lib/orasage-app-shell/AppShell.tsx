'use client';

import { ChevronLeft } from 'lucide-react';
import { type ReactNode } from 'react';
import { Button } from '@orasage/ui/button';
import { appBrandLabel, shouldShowAppShellPageBack, type AppId } from './config';
import { SiteTopNav } from './SiteTopNav';
import { pickLabel, SHELL_LABELS } from './labels';
import './app-shell.css';

export type LocaleOption = { code: string; label: string };

export type AppShellProps = {
  appId: AppId;
  locale?: string;
  locales?: LocaleOption[];
  onLocaleChange?: (code: string) => void;
  theme?: 'light' | 'dark';
  pathname?: string;
  /** @deprecated 移动端已改用顶栏折叠菜单，底栏默认关闭 */
  showBottomNav?: boolean;
  /** @deprecated 已合并进 SiteTopNav */
  showMobileBar?: boolean;
  showSiteTopNav?: boolean;
  immersive?: boolean;
  /** 子页顶栏返回；false 时由页面内流程自行处理（如 temple 多步向导） */
  showPageBack?: boolean;
  showLocaleSwitcher?: boolean;
  footer?: ReactNode;
  /** 顶栏右侧插槽（PC 导航尾、移动顶栏登录旁），如 shop 购物车 */
  headerExtra?: ReactNode;
  /** 覆盖默认 LocaleSwitcher */
  localeSwitcher?: ReactNode;
  children: ReactNode;
};

/** 子应用外壳：全端顶栏（移动折叠菜单）+ 可选页脚 */
export function AppShell({
  appId,
  locale = 'zh-CN',
  theme = 'dark',
  pathname = '/',
  showSiteTopNav = true,
  immersive = false,
  showPageBack = true,
  showLocaleSwitcher = true,
  footer = null,
  headerExtra = null,
  localeSwitcher = null,
  onLocaleChange,
  children,
}: AppShellProps) {
  const showBack = showPageBack && shouldShowAppShellPageBack(appId, pathname) && !immersive;

  return (
    <div className="orasage-app-shell orasage-grain" data-theme={theme} data-app={appId}>
      {showSiteTopNav && (
        <SiteTopNav
          locale={locale}
          context={appId}
          trailing={headerExtra}
          showLocaleSwitcher={showLocaleSwitcher}
          localeSwitcher={localeSwitcher}
          onLocaleChange={onLocaleChange}
        />
      )}

      <main
        className={`orasage-app-main orasage-app-main--column orasage-app-main--no-bottomnav${immersive ? ' orasage-app-main--immersive' : ''}`}
      >
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
    </div>
  );
}

export { APP_BRANDS, ORASAGE_URLS, appBrandLabel, type AppId } from './config';
export { AppBrandMark } from './AppBrandMark';
export type { NavContext } from './config';
export { isMainPortalHome } from './config';
