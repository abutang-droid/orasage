'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeaderAuthButton } from '@/components/HeaderAuthButton';
import { SiteTopNav } from '@/lib/orasage-app-shell/SiteTopNav';

/** 门户顶栏：PC 全站主导航；移动仅 Logo + 登录（主导航在底栏 5 键） */
export function Header() {
  const locale = useLocale();

  return (
    <>
      <header className="orasage-site-mobile-bar border-border/70 bg-background lg:hidden">
        <Link href="/" className="orasage-site-mobile-bar-brand">
          OraSage
        </Link>
        <HeaderAuthButton className="px-3 py-2 text-xs" />
      </header>
      <SiteTopNav locale={locale} />
    </>
  );
}
