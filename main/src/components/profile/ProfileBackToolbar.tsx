'use client';

import { Icon } from '@orasage/ui';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export function isProfileSubpage(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p.startsWith('/profile/');
}

/** Fixed back link to profile hub — avoids unreliable history.back() */
export function ProfileBackToolbar() {
  const t = useTranslations('profile');
  const pathname = usePathname();

  if (!isProfileSubpage(pathname)) return null;

  return (
    <div className="orasage-page-toolbar -mx-1 mb-2 px-0 pt-0 sm:mb-3">
      <Link href="/profile" className="orasage-page-back">
        <Icon name="chevronLeft" className="h-[18px] w-[18px] rtl:rotate-180" />
        {t('nav.overview')}
      </Link>
    </div>
  );
}
