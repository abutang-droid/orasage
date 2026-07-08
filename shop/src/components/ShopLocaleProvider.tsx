'use client';

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
  const [locale, setLocale] = useState('zh-CN');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('locale');
    if (fromQuery) {
      const normalized = detectShopLocale({ queryLocale: fromQuery });
      setLocale(normalized);
      document.cookie = `${SHOP_LOCALE_OVERRIDE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=31536000; SameSite=Lax`;
      return;
    }

    const override = readCookie(SHOP_LOCALE_OVERRIDE_COOKIE);
    const portal = readCookie(SHOP_LOCALE_COOKIE);
    setLocale(
      detectShopLocale({
        cookieLocale: override ?? portal,
        acceptLanguage: navigator.language,
      }),
    );
  }, []);

  const applyLocale = useCallback((raw: string) => {
    const normalized = detectShopLocale({ queryLocale: raw });
    document.cookie = `${SHOP_LOCALE_OVERRIDE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleCookie(normalized);
    setLocale(normalized);
  }, []);

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
