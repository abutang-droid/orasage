'use client';

import { usePathname } from 'next/navigation';
import { AppShell, type LocaleOption } from '@/lib/orasage-app-shell';
import { useLocale } from '@/lib/i18n';

const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português (BR)' },
];

export function OraSageAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();

  return (
    <AppShell
      appId="ziwei"
      locale={locale}
      locales={LOCALE_OPTIONS}
      onLocaleChange={(code) => setLocale(code as typeof locale)}
      theme="light"
      pathname={pathname}
    >
      {children}
    </AppShell>
  );
}
