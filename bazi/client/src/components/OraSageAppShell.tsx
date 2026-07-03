'use client';

import { useLocation } from 'wouter';
import { AppShell } from '@/lib/orasage-app-shell';
import { useT } from '@/lib/i18n';
import { PortalFooter } from '@/components/PortalFooter';

export function OraSageAppShell({ children }: { children: React.ReactNode }) {
  const { locale } = useT();
  const [pathname] = useLocation();

  return (
    <AppShell
      appId="bazi"
      locale={locale}
      theme="light"
      pathname={pathname}
      footer={<PortalFooter />}
    >
      {children}
    </AppShell>
  );
}
