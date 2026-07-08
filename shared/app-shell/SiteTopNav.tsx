'use client';

import type { ReactNode } from 'react';
import { appBrandLabel, appHomeUrl, daozangUrl, famousUrl, mainPortalUrl, ORASAGE_URLS, type NavContext } from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import { OrasageAuthChip } from './OrasageAuthChip';

const TOP_NAV_ITEMS = [
  { id: 'home' as const, href: (locale: string) => mainPortalUrl(locale), external: false },
  { id: 'bazi' as const, href: ORASAGE_URLS.bazi, external: true },
  { id: 'ziwei' as const, href: ORASAGE_URLS.ziwei, external: true },
  { id: 'tarot' as const, href: ORASAGE_URLS.tarot, external: true },
  { id: 'blessing' as const, href: ORASAGE_URLS.temple, external: true },
  { id: 'shop' as const, href: ORASAGE_URLS.shop, external: true },
  { id: 'famous' as const, href: (locale: string) => famousUrl(locale), external: false },
  { id: 'daozang' as const, href: (locale: string) => daozangUrl(locale), external: false },
];

export type SiteTopNavProps = {
  locale?: string;
  /** portal = OraSage；子应用 = 独立品牌（BaZi / ZiWei / ManTo） */
  context?: NavContext;
  /** 导航右侧、登录芯片前的插槽（如 shop 购物车） */
  trailing?: ReactNode;
};

/** PC 顶栏 — 左品牌 + 右导航，与页面同色（非浮层色块） */
export function SiteTopNav({ locale = 'zh-CN', context = 'portal', trailing = null }: SiteTopNavProps) {
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
            const href = typeof item.href === 'function' ? item.href(locale) : item.href;
            const label = pickLabel(SHELL_LABELS[item.id], locale);
            return (
              <a key={item.id} href={href} className="orasage-site-topnav-link">
                {label}
              </a>
            );
          })}
          {trailing}
          <OrasageAuthChip locale={locale} />
        </nav>
      </div>
    </header>
  );
}
