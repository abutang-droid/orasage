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
import { cookieDomain, setLocaleCookie } from '@/lib/orasage-app-shell';

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

function writeOverrideCookie(locale: string): void {
  if (typeof document === 'undefined') return;
  const domain = cookieDomain();
  const domainPart = domain ? `; domain=${domain}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${SHOP_LOCALE_OVERRIDE_COOKIE}=${encodeURIComponent(locale)}; path=/${domainPart}; max-age=31536000; SameSite=Lax${secure}`;
}

/** Keep `?locale=` in sync so refresh / share links don't snap back to an old query. */
function syncShopLocaleUrl(locale: string): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (locale === 'zh-CN') url.searchParams.delete('locale');
  else url.searchParams.set('locale', locale);
  window.history.replaceState({}, '', url.toString());
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
      writeOverrideCookie(normalized);
      setLocaleCookie(normalized);
      if (normalized !== fromQuery) syncShopLocaleUrl(normalized);
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
      syncShopLocaleUrl(detected);
      router.refresh();
    }
  }, [intlLocale, router]);

  const applyLocale = useCallback((raw: string) => {
    const normalized = detectShopLocale({ queryLocale: raw });
    writeOverrideCookie(normalized);
    setLocaleCookie(normalized);
    syncShopLocaleUrl(normalized);
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
