'use client';

import type { ReactNode } from 'react';
import { appBrandLabel, appHomeUrl, daozangUrl, famousUrl, mainPortalUrl, ORASAGE_URLS, type NavContext } from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import { LocaleSwitcher } from './LocaleSwitcher';
import { OrasageAuthChip } from './OrasageAuthChip';

type NavItem = {
  id: 'home' | 'bazi' | 'ziwei' | 'tarot' | 'blessing' | 'shop' | 'famous' | 'daozang';
  href: (locale: string) => string;
};

const TOP_NAV_ITEMS: NavItem[] = [
  { id: 'home', href: (locale) => mainPortalUrl(locale) },
  { id: 'bazi', href: () => ORASAGE_URLS.bazi },
  { id: 'ziwei', href: () => ORASAGE_URLS.ziwei },
  { id: 'tarot', href: () => ORASAGE_URLS.tarot },
  { id: 'blessing', href: () => ORASAGE_URLS.temple },
  { id: 'shop', href: () => ORASAGE_URLS.shop },
  { id: 'famous', href: (locale) => famousUrl(locale) },
  { id: 'daozang', href: (locale) => daozangUrl(locale) },
];

export type SiteTopNavProps = {
  locale?: string;
  /** portal = OraSage；子应用 = 独立品牌（BaZi / ZiWei / Manto） */
  context?: NavContext;
  /** 导航右侧、登录芯片前的插槽（如 shop 购物车） */
  trailing?: ReactNode;
  showLocaleSwitcher?: boolean;
  onLocaleChange?: (locale: string) => void;
};

/** PC 顶栏 — 已下线（CSS 隐藏）；保留以免遗留引用崩掉 */
export function SiteTopNav({
  locale = 'zh-CN',
  context = 'portal',
  trailing = null,
  showLocaleSwitcher = true,
  onLocaleChange,
}: SiteTopNavProps) {
  const isPortal = context === 'portal';
  const brandLabel = isPortal ? 'OraSage' : appBrandLabel(context, locale);
  const brandHref = isPortal ? mainPortalUrl(locale) : appHomeUrl(context);

  return (
    <header className="orasage-site-topnav">
      <div className="orasage-site-topnav-inner">
        <a href={brandHref} className="orasage-site-topnav-brand">
          {brandLabel}
        </a>
        <nav className="orasage-site-topnav-menu" aria-label="Site navigation">
          {TOP_NAV_ITEMS.map((item) => {
            const href = item.href(locale);
            const label = pickLabel(SHELL_LABELS[item.id], locale);
            return (
              <a key={item.id} href={href} className="orasage-site-topnav-link">
                {label}
              </a>
            );
          })}
          {trailing}
          {showLocaleSwitcher && (
            <LocaleSwitcher locale={locale} context={context} onLocaleChange={onLocaleChange} />
          )}
          <OrasageAuthChip locale={locale} />
        </nav>
      </div>
    </header>
  );
}
