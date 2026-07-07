'use client';

import { Icon } from '@orasage/ui';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { shouldShowPortalBack } from '@/lib/portal-header';

/** Back control for nested portal pages (replaces subpage header back button) */
export function PortalBackToolbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  if (!shouldShowPortalBack(pathname)) return null;

  return (
    <div className="orasage-page-toolbar -mx-1 mb-2 px-0 pt-0 sm:mb-3">
      <button
        type="button"
        onClick={() => window.history.back()}
        className="orasage-page-back"
      >
        <Icon name="chevronLeft" className="h-[18px] w-[18px] rtl:rotate-180" />
        {t('back')}
      </button>
    </div>
  );
}
