'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from '@/lib/orasage-app-shell';
import { useLocale } from '@/lib/i18n';
import { PortalFooter } from '@/components/PortalFooter';

export function OraSageAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale } = useLocale();

  return (
    <AppShell
      appId="ziwei"
      locale={locale}
      theme="light"
      pathname={pathname}
      footer={<PortalFooter />}
    >
      {children}
    </AppShell>
  );
}
