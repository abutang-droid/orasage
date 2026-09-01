'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';
import { PortalLocaleSwitcher } from '@/components/PortalLocaleSwitcher';
import { OrasageAuthChip } from '@/lib/orasage-app-shell/OrasageAuthChip';
import { getUtilityNav } from '@/lib/orasage-app-shell/primary-nav';
import { Search } from 'lucide-react';

/** 门户顶栏：PC 用共享 SiteTopNav（P1 IA）；移动左品牌 + 搜索/语言/登录 */
export function Header() {
  const locale = useLocale();
  const util = getUtilityNav(locale);

  return (
    <>
      <header className="safe-top orasage-site-mobile-bar border-b border-border/80 bg-background lg:hidden">
        <Link href="/" className="orasage-site-mobile-bar-brand font-serif text-lg tracking-wide text-foreground">
          OraSage
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={util.search.href}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground"
            aria-label={util.search.label}
          >
            <Search size={18} strokeWidth={1.6} aria-hidden />
          </a>
          <PortalLocaleSwitcher />
          <OrasageAuthChip locale={locale} />
        </div>
      </header>

      <div className="hidden lg:block border-b border-border/80 bg-background [&_.orasage-site-topnav]:block [&_.orasage-site-topnav]:bg-background">
        <SiteTopNav
          locale={locale}
          context="portal"
          showLocaleSwitcher
        />
      </div>
    </>
  );
}
