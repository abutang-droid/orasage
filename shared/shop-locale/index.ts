/** Shop locale ↔ currency — shared by shop, auth-service, admin */

import {
  detectLocale as detectLocaleBase,
  LOCALE_COOKIE,
  LOCALE_OVERRIDE_COOKIE,
  normalizeLocale,
} from '../../packages/i18n/src';

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

const CNY_LOCALES = new Set(['zh-cn', 'zh-tw', 'zh']);

export function currencyForLocale(locale: string): ShopCurrency {
  const norm = normalizeShopLocale(locale).toLowerCase();
  if (CNY_LOCALES.has(norm) || norm.startsWith('zh-')) return 'cny';
  return 'usd';
}

export function isShopCurrency(value: string): value is ShopCurrency {
  return value === 'cny' || value === 'usd';
}

export type ProductPricing = {
  priceCents: number;
  priceCentsUsd?: number | null;
};

const CNY_TO_USD_RATE = Number(process.env.CNY_TO_USD_RATE ?? '7.2');

export function resolvePriceCents(pricing: ProductPricing, currency: ShopCurrency): number {
  if (currency === 'cny') return pricing.priceCents;
  if (pricing.priceCentsUsd != null && pricing.priceCentsUsd > 0) return pricing.priceCentsUsd;
  return Math.max(50, Math.round(pricing.priceCents / CNY_TO_USD_RATE));
}

export function formatShopPrice(cents: number, currency: ShopCurrency): string {
  if (currency === 'cny') return `¥${(cents / 100).toFixed(2)}`;
  return `$${(cents / 100).toFixed(2)}`;
}
