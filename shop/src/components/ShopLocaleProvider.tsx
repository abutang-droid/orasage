'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  currencyForLocale,
  detectShopLocale,
  SHOP_LOCALE_COOKIE,
  SHOP_LOCALE_OVERRIDE_COOKIE,
  type ShopCurrency,
} from '../../../shared/shop-locale/index';
import { setLocaleCookie } from '@/lib/orasage-app-shell';

type ShopLocaleContextValue = {
  locale: string;
  currency: ShopCurrency;
  setLocale: (locale: string) => void;
};

const ShopLocaleContext = createContext<ShopLocaleContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export function ShopLocaleProvider({ children }: { children: React.ReactNode }) {
  const intlLocale = useLocale();
  const router = useRouter();
  const [locale, setLocaleState] = useState(intlLocale);

  useEffect(() => {
    setLocaleState(intlLocale);
  }, [intlLocale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('locale');
    if (fromQuery) {
      const normalized = detectShopLocale({ queryLocale: fromQuery });
      document.cookie = `${SHOP_LOCALE_OVERRIDE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=31536000; SameSite=Lax`;
      setLocaleCookie(normalized);
      router.refresh();
      return;
    }

    const override = readCookie(SHOP_LOCALE_OVERRIDE_COOKIE);
    const portal = readCookie(SHOP_LOCALE_COOKIE);
    const detected = detectShopLocale({
      cookieLocale: override ?? portal,
      acceptLanguage: navigator.language,
    });
    if (detected !== intlLocale) {
      setLocaleCookie(detected);
      router.refresh();
    }
  }, [intlLocale, router]);

  const applyLocale = useCallback((raw: string) => {
    const normalized = detectShopLocale({ queryLocale: raw });
    document.cookie = `${SHOP_LOCALE_OVERRIDE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleCookie(normalized);
    setLocaleState(normalized);
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ locale, currency: currencyForLocale(locale), setLocale: applyLocale }),
    [locale, applyLocale],
  );

  return <ShopLocaleContext.Provider value={value}>{children}</ShopLocaleContext.Provider>;
}

export function useShopLocale() {
  const ctx = useContext(ShopLocaleContext);
  if (!ctx) throw new Error('useShopLocale must be used within ShopLocaleProvider');
  return ctx;
}
