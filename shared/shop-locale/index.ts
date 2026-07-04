/** Shop locale ↔ currency — shared by shop, auth-service, admin */

export type ShopCurrency = 'cny' | 'usd';

export const SHOP_LOCALE_COOKIE = 'NEXT_LOCALE';
export const SHOP_LOCALE_OVERRIDE_COOKIE = 'orasage_shop_locale';

const CNY_LOCALES = new Set(['zh-cn', 'zh-tw', 'zh']);

export function normalizeShopLocale(input?: string | null): string {
  if (!input?.trim()) return 'zh-CN';
  const tag = input.trim().replace('_', '-');
  const lower = tag.toLowerCase();
  if (lower === 'zh' || lower === 'zh-hans') return 'zh-CN';
  if (lower.startsWith('zh-tw') || lower === 'zh-hant') return 'zh-TW';
  if (lower.startsWith('zh')) return 'zh-CN';
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('es')) return 'es';
  if (lower.startsWith('en')) return 'en';
  return tag;
}

export function detectShopLocale(options?: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
  queryLocale?: string | null;
}): string {
  if (options?.queryLocale) return normalizeShopLocale(options.queryLocale);
  if (options?.cookieLocale) return normalizeShopLocale(options.cookieLocale);
  if (options?.acceptLanguage) {
    const first = options.acceptLanguage.split(',')[0]?.split(';')[0]?.trim();
    if (first) return normalizeShopLocale(first);
  }
  return 'zh-CN';
}

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
