/** Shop locale ↔ currency — shared by shop, auth-service, admin */

import {
  detectLocale as detectLocaleBase,
  LOCALE_COOKIE,
  LOCALE_OVERRIDE_COOKIE,
  normalizeLocale,
} from '../../packages/i18n/src';

export type ShopCurrency = 'cny' | 'usd';

/** 结账支付币种 */
export type PayCurrency = 'USDT' | 'WOLD';

export const PAY_CURRENCIES = ['USDT', 'WOLD'] as const;

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
 * 前台统一以 USDT（= USD 分）列价；不再按语言切 CNY。
 * 保留 `cny` 类型仅供后台/遗留字段展示。
 */
export function currencyForLocale(_locale: string): ShopCurrency {
  return 'usd';
}

export function isShopCurrency(value: string): value is ShopCurrency {
  return value === 'cny' || value === 'usd';
}

export function isPayCurrency(value: string): value is PayCurrency {
  const upper = value.trim().toUpperCase();
  return upper === 'USDT' || upper === 'WOLD';
}

export function normalizePayCurrency(value: string | null | undefined): PayCurrency | null {
  if (!value) return null;
  const upper = value.trim().toUpperCase();
  if (upper === 'USDT' || upper === 'USD') return 'USDT';
  if (upper === 'WOLD') return 'WOLD';
  return null;
}

export type ProductPricing = {
  priceCents: number;
  priceCentsUsd?: number | null;
};

const CNY_TO_USD_RATE = Number(process.env.CNY_TO_USD_RATE ?? '7.2');

/** 运行时汇率覆盖（来自 shop_settings，优先于 env） */
let runtimeWoldPerUsdt: number | null = null;

export function setRuntimeWoldPerUsdt(rate: number | null | undefined): void {
  if (rate == null || !Number.isFinite(rate) || rate <= 0) {
    runtimeWoldPerUsdt = null;
    return;
  }
  runtimeWoldPerUsdt = rate;
}

export function cnyToUsdRate(): number {
  return Number.isFinite(CNY_TO_USD_RATE) && CNY_TO_USD_RATE > 0 ? CNY_TO_USD_RATE : 7.2;
}

/** 1 USDT = N WOLD */
export function woldPerUsdt(): number {
  if (runtimeWoldPerUsdt != null) return runtimeWoldPerUsdt;
  const n = Number(process.env.WOLD_PER_USDT ?? '1');
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function resolvePriceCents(pricing: ProductPricing, currency: ShopCurrency): number {
  if (currency === 'cny') return pricing.priceCents;
  if (pricing.priceCentsUsd != null && pricing.priceCentsUsd > 0) return pricing.priceCentsUsd;
  return Math.max(50, Math.round(pricing.priceCents / cnyToUsdRate()));
}

/** 商品 USDT 分（与 USD 分 1:1；列价以 priceCentsUsd 为准） */
export function resolveUsdtCents(pricing: ProductPricing): number {
  return resolvePriceCents(pricing, 'usd');
}

/** USDT 分 → WOLD 分（同精度百分之一） */
export function resolveWoldCents(usdtCents: number, rate = woldPerUsdt()): number {
  return Math.round(usdtCents * rate);
}

/** 从 USDT 订单金额换算支付币种金额（分） */
export function resolvePayAmountCents(usdtCents: number, payCurrency: PayCurrency, rate = woldPerUsdt()): number {
  if (payCurrency === 'WOLD') return resolveWoldCents(usdtCents, rate);
  return usdtCents;
}

export function formatUsdtPrice(usdtCents: number): string {
  return `${(usdtCents / 100).toFixed(2)} USDT`;
}

export function formatWoldPrice(woldCents: number): string {
  return `${(woldCents / 100).toFixed(2)} WOLD`;
}

export function formatPayPrice(cents: number, payCurrency: PayCurrency): string {
  return payCurrency === 'WOLD' ? formatWoldPrice(cents) : formatUsdtPrice(cents);
}

/** 前台主展示：USDT + WOLD */
export function formatDualShopPrice(pricingOrUsdtCents: ProductPricing | number, rate = woldPerUsdt()): string {
  const usdtCents =
    typeof pricingOrUsdtCents === 'number'
      ? pricingOrUsdtCents
      : resolveUsdtCents(pricingOrUsdtCents);
  return `${formatUsdtPrice(usdtCents)} · ${formatWoldPrice(resolveWoldCents(usdtCents, rate))}`;
}

export function formatShopPrice(cents: number, currency: ShopCurrency): string {
  if (currency === 'cny') return `¥${(cents / 100).toFixed(2)}`;
  return formatUsdtPrice(cents);
}

/** 后台只配 USDT 时，同步写回遗留 CNY 分 */
export function usdtCentsToLegacyCnyCents(usdtCents: number): number {
  return Math.max(0, Math.round(usdtCents * cnyToUsdRate()));
}

export {
  PRODUCT_MEDIA_FALLBACK_LOCALES,
  productMediaLocaleChain,
  mergeProductMediaFromPages,
  mediaFallbackRuleLabel,
  type ProductMediaBundle,
  type ProductMediaSources,
} from './media-fallback';
