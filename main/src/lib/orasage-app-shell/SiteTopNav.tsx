'use client';

import { daozangUrl, famousUrl, mainPortalUrl, ORASAGE_URLS } from './config';
import { pickLabel, SHELL_LABELS } from './labels';
import { OrasageAuthChip } from './OrasageAuthChip';

const TOP_NAV_ITEMS = [
  { id: 'bazi' as const, href: ORASAGE_URLS.bazi, external: true },
  { id: 'ziwei' as const, href: ORASAGE_URLS.ziwei, external: true },
  { id: 'tarot' as const, href: ORASAGE_URLS.tarot, external: true },
  { id: 'famous' as const, href: (locale: string) => famousUrl(locale), external: false },
  { id: 'daozang' as const, href: (locale: string) => daozangUrl(locale), external: false },
];

/** PC 顶栏主导航 — 全站统一（移动端由 CSS 隐藏） */
export function SiteTopNav({ locale = 'zh-CN' }: { locale?: string }) {
  return (
    <header className="orasage-site-topnav">
      <div className="orasage-site-topnav-inner">
        <a href={mainPortalUrl(locale)} className="orasage-site-topnav-brand">
          OraSage
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
        </nav>
        <div className="orasage-site-topnav-auth">
          <OrasageAuthChip locale={locale} />
        </div>
      </div>
    </header>
  );
}
