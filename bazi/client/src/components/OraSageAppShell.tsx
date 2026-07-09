'use client';

import { useLocation } from 'wouter';
import { useI18n } from '@orasage/i18n/react';
import { AppShell } from '@/lib/orasage-app-shell';
import { PortalFooter } from '@/components/PortalFooter';

export function OraSageAppShell({ children }: { children: React.ReactNode }) {
  const { locale, setLocale } = useI18n();
  const [pathname] = useLocation();

  return (
    <AppShell
      appId="bazi"
      locale={locale}
      onLocaleChange={setLocale}
      theme="light"
      pathname={pathname}
      footer={<PortalFooter />}
    >
      {children}
    </AppShell>
  );
}
