'use client';

import { usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';
import { FixedBottomNav } from '@/lib/orasage-app-shell/BottomNav';
import { isMainPortalHome } from '@/lib/orasage-app-shell/config';

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const isHome = isMainPortalHome(pathname);

  return (
    <>
      <main className={`flex-1${isHome ? '' : ' orasage-portal-main'}`}>{children}</main>
      {!isHome && (
        <div className="orasage-app-shell" data-theme="light" style={{ minHeight: 0, background: 'transparent' }}>
          <FixedBottomNav context="portal" locale={locale} pathname={pathname} />
        </div>
      )}
    </>
  );
}
