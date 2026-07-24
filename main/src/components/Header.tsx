'use client';

import { useLocale } from 'next-intl';
import { OrasageAuthChip } from '@/lib/orasage-app-shell/OrasageAuthChip';
import { PortalLocaleSwitcher } from '@/components/PortalLocaleSwitcher';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

/** 门户顶栏：仅移动壳（品牌 + 登录），宽屏同布局 */
export function Header() {
  const locale = useLocale();
  const tarotHref =
    locale === 'zh-CN' ? ORASAGE_URLS.tarot : `${ORASAGE_URLS.tarot}?lang=${encodeURIComponent(locale)}`;

  return (
    <header className="safe-top orasage-site-mobile-bar border-b border-border/80 bg-background">
      <a href={tarotHref} className="orasage-site-mobile-bar-brand font-serif text-lg tracking-wide text-foreground">
        OraSage
      </a>
      <div className="flex items-center gap-2">
        <PortalLocaleSwitcher />
        <OrasageAuthChip locale={locale} />
      </div>
    </header>
  );
}
