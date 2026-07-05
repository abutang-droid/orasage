'use client';

import { CityProvider } from '@orasage/city/react';
import { cityApi } from '@/lib/city-client';
import { useLocale } from '@/lib/i18n';

export function CityProviderShell({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  return (
    <CityProvider api={cityApi} locale={locale}>
      {children}
    </CityProvider>
  );
}
