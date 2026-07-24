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

/** Build URL with `?locale=` in sync so refresh / share links don't snap back to an old query. */
function shopLocaleUrl(locale: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('locale', locale);
  return url.toString();
}

/** Soft URL sync (no navigation) — used on first-load cookie detection. */
function syncShopLocaleUrl(locale: string): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, '', shopLocaleUrl(locale));
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
      cookieLocale: portal ?? override,
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
    // Soft RSC refresh leaves NextIntlClientProvider / SSR product copy stale.
    // Hard navigate so layout, messages, and catalog all remount with the new locale.
    window.location.assign(shopLocaleUrl(normalized));
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
