/** Shop locale ↔ currency — shared by shop, auth-service, admin.
 *
 * Sitewide billing is USD-only. Locale still drives copy; list price is always USD.
 */

import {
  detectLocale as detectLocaleBase,
  LOCALE_COOKIE,
  LOCALE_OVERRIDE_COOKIE,
  normalizeLocale,
} from '../../packages/i18n/src';

/** Kept for type compatibility; storefront billing always resolves to `usd`. */
export type ShopCurrency = 'cny' | 'usd';

export const SHOP_LOCALE_COOKIE = LOCALE_COOKIE;
export const SHOP_LOCALE_OVERRIDE_COOKIE = LOCALE_OVERRIDE_COOKIE;

export const normalizeShopLocale = normalizeLocale;

export function detectShopLocale(options?: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
  queryLocale?: string | null;
}): string {
  return detectLocaleBase(options);
}

/** Catalog / checkout always charge in USD (ignore locale). */
export function currencyForLocale(_locale?: string): ShopCurrency {
  return 'usd';
}

export function isShopCurrency(value: string): value is ShopCurrency {
  return value === 'cny' || value === 'usd';
}

export type ProductPricing = {
  priceCents: number;
  priceCentsUsd?: number | null;
};

/**
 * Resolve list/charge amount in cents.
 * Prefer `priceCentsUsd`; fall back to `priceCents` treated as USD cents (mirrored writes).
 */
export function resolvePriceCents(pricing: ProductPricing, _currency: ShopCurrency = 'usd'): number {
  if (pricing.priceCentsUsd != null && pricing.priceCentsUsd > 0) return pricing.priceCentsUsd;
  return Math.max(0, pricing.priceCents);
}

export function formatShopPrice(cents: number, _currency: ShopCurrency = 'usd'): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Order / Stripe currency code (uppercase). */
export function orderCurrencyCode(_locale?: string): 'USD' {
  return 'USD';
}
