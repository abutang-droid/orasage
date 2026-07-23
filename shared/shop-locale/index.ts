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
 * 前台/后端统一以 USDT（= USD 分）列价；WOLD 仅展示/支付派生。
 * 保留 `cny` 类型仅兼容极少数遗留调用。
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
  /** 遗留列：现与 USDT 分对齐存储，不再表示 CNY */
  priceCents: number;
  /** 列价源：USDT 分（与 USD 分 1:1） */
  priceCentsUsd?: number | null;
};

/** @deprecated 列价已统一 USDT；仅用于一次性历史回填 */
const LEGACY_CNY_TO_USDT_RATE = Number(process.env.CNY_TO_USD_RATE ?? '7.2');

/** 运行时汇率覆盖（来自 shop_settings，优先于 env） */
let runtimeWoldPerUsdt: number | null = null;

export function setRuntimeWoldPerUsdt(rate: number | null | undefined): void {
  if (rate == null || !Number.isFinite(rate) || rate <= 0) {
    runtimeWoldPerUsdt = null;
    return;
  }
  runtimeWoldPerUsdt = rate;
}

/** @deprecated */
export function cnyToUsdRate(): number {
  return Number.isFinite(LEGACY_CNY_TO_USDT_RATE) && LEGACY_CNY_TO_USDT_RATE > 0
    ? LEGACY_CNY_TO_USDT_RATE
    : 7.2;
}

/** 1 USDT = N WOLD */
export function woldPerUsdt(): number {
  if (runtimeWoldPerUsdt != null) return runtimeWoldPerUsdt;
  const n = Number(process.env.WOLD_PER_USDT ?? '1');
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * 解析列价（分）。
 * - usd：USDT 分（优先 priceCentsUsd，否则 priceCents — 迁移后二者同为 USDT）
 * - cny：遗留调用，返回同一数值（已不再表示人民币）
 */
export function resolvePriceCents(pricing: ProductPricing, currency: ShopCurrency): number {
  const usdt = resolveUsdtCents(pricing);
  if (currency === 'cny') return usdt;
  return usdt;
}

/** 商品 USDT 分（列价源） */
export function resolveUsdtCents(pricing: ProductPricing): number {
  if (pricing.priceCentsUsd != null && pricing.priceCentsUsd > 0) {
    return pricing.priceCentsUsd;
  }
  if (pricing.priceCents > 0) return pricing.priceCents;
  return 0;
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

/** 前台/后台主展示：USDT + WOLD */
export function formatDualShopPrice(pricingOrUsdtCents: ProductPricing | number, rate = woldPerUsdt()): string {
  const usdtCents =
    typeof pricingOrUsdtCents === 'number'
      ? pricingOrUsdtCents
      : resolveUsdtCents(pricingOrUsdtCents);
  return `${formatUsdtPrice(usdtCents)} · ${formatWoldPrice(resolveWoldCents(usdtCents, rate))}`;
}

export function formatShopPrice(cents: number, currency: ShopCurrency): string {
  if (currency === 'cny') return formatUsdtPrice(cents);
  return formatUsdtPrice(cents);
}

/**
 * 写入目录价时：两列同存 USDT 分（兼容仍读 price_cents 的旧路径）。
 * @deprecated 名称保留；不再换算 CNY。
 */
export function usdtCentsToLegacyCnyCents(usdtCents: number): number {
  return Math.max(0, Math.round(usdtCents));
}

/** 后台保存：USDT 分 → 双列同写 */
export function usdtCentsAsListPair(usdtCents: number): { priceCents: number; priceCentsUsd: number } {
  const n = Math.max(0, Math.round(usdtCents));
  return { priceCents: n, priceCentsUsd: n };
}

export {
  PRODUCT_MEDIA_FALLBACK_LOCALES,
  productMediaLocaleChain,
  mergeProductMediaFromPages,
  mediaFallbackRuleLabel,
  type ProductMediaBundle,
  type ProductMediaSources,
} from './media-fallback';

export { formatOrderAmountDisplay } from './format-order-amount';
