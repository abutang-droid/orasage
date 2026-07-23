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

/**
 * 前台统一以 USDT（= USD 分）结算；不再按语言切 CNY。
 * 保留 `cny` 类型仅供后台/遗留字段展示。
 */
export function currencyForLocale(_locale: string): ShopCurrency {
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

/** 1 USDT = N WOLD（可用环境变量覆盖） */
export function woldPerUsdt(): number {
  const n = Number(process.env.WOLD_PER_USDT ?? '1');
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function resolvePriceCents(pricing: ProductPricing, currency: ShopCurrency): number {
  if (currency === 'cny') return pricing.priceCents;
  if (pricing.priceCentsUsd != null && pricing.priceCentsUsd > 0) return pricing.priceCentsUsd;
  return Math.max(50, Math.round(pricing.priceCents / CNY_TO_USD_RATE));
}

/** 商品 USDT 分（与 USD 分 1:1） */
export function resolveUsdtCents(pricing: ProductPricing): number {
  return resolvePriceCents(pricing, 'usd');
}

/** USDT 分 → WOLD 分（同精度百分之一） */
export function resolveWoldCents(usdtCents: number): number {
  return Math.round(usdtCents * woldPerUsdt());
}

export function formatUsdtPrice(usdtCents: number): string {
  return `${(usdtCents / 100).toFixed(2)} USDT`;
}

export function formatWoldPrice(woldCents: number): string {
  return `${(woldCents / 100).toFixed(2)} WOLD`;
}

/** 前台主展示：USDT + WOLD */
export function formatDualShopPrice(pricingOrUsdtCents: ProductPricing | number): string {
  const usdtCents =
    typeof pricingOrUsdtCents === 'number'
      ? pricingOrUsdtCents
      : resolveUsdtCents(pricingOrUsdtCents);
  return `${formatUsdtPrice(usdtCents)} · ${formatWoldPrice(resolveWoldCents(usdtCents))}`;
}

export function formatShopPrice(cents: number, currency: ShopCurrency): string {
  if (currency === 'cny') return `¥${(cents / 100).toFixed(2)}`;
  return formatUsdtPrice(cents);
}

export {
  PRODUCT_MEDIA_FALLBACK_LOCALES,
  productMediaLocaleChain,
  mergeProductMediaFromPages,
  mediaFallbackRuleLabel,
  type ProductMediaBundle,
  type ProductMediaSources,
} from './media-fallback';
