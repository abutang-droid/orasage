'use client';

import type { ReactNode } from 'react';
import {
  appBrandLabel,
  appHomeUrl,
  daozangUrl,
  famousUrl,
  mainPortalUrl,
  shopUrl,
  templeUrl,
  type NavContext,
} from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import { LocaleSwitcher } from './LocaleSwitcher';
import { OrasageAuthChip } from './OrasageAuthChip';

const TOP_NAV_ITEMS = [
  { id: 'home' as const, href: (locale: string) => mainPortalUrl(locale) },
  { id: 'bazi' as const, href: (locale: string) => appHomeUrl('bazi', locale) },
  { id: 'ziwei' as const, href: (locale: string) => appHomeUrl('ziwei', locale) },
  { id: 'tarot' as const, href: (locale: string) => appHomeUrl('tarot', locale) },
  { id: 'blessing' as const, href: (locale: string) => templeUrl(locale) },
  { id: 'shop' as const, href: (locale: string) => shopUrl(locale) },
  { id: 'famous' as const, href: (locale: string) => famousUrl(locale) },
  { id: 'daozang' as const, href: (locale: string) => daozangUrl(locale) },
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

/** PC 顶栏 — 左品牌 + 右导航，与页面同色（非浮层色块） */
export function SiteTopNav({
  locale = 'zh-CN',
  context = 'portal',
  trailing = null,
  showLocaleSwitcher = true,
  onLocaleChange,
}: SiteTopNavProps) {
  const isPortal = context === 'portal';
  const brandLabel = isPortal ? 'OraSage' : appBrandLabel(context, locale);
  const brandHref = isPortal ? mainPortalUrl(locale) : appHomeUrl(context, locale);

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
