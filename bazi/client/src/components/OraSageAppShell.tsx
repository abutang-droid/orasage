'use client';

import { useLocation } from 'wouter';
import { AppShell, type LocaleOption } from '@/lib/orasage-app-shell';
import { LOCALE_LABELS, type Locale } from '@/lib/i18n';
import { useT } from '@/lib/i18n';

const LOCALE_OPTIONS: LocaleOption[] = (Object.keys(LOCALE_LABELS) as Locale[]).map((code) => ({
  code,
  label: LOCALE_LABELS[code],
}));

function setLocaleInUrl(code: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', code);
  window.location.href = url.toString();
}

export function OraSageAppShell({ children }: { children: React.ReactNode }) {
  const { locale } = useT();
  const [pathname] = useLocation();

  return (
    <AppShell
      appId="bazi"
      locale={locale}
      locales={LOCALE_OPTIONS}
      onLocaleChange={setLocaleInUrl}
      theme="light"
      pathname={pathname}
    >
      {children}
    </AppShell>
  );
}
