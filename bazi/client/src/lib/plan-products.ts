import type { PlanType } from '@shared/types';

const AUTH_URL = (import.meta.env.VITE_AUTH_URL as string | undefined) || 'https://auth.orasage.com';
const SHOP_URL = (import.meta.env.VITE_SHOP_URL as string | undefined) || 'https://shop.orasage.com';

/** Catalog SKUs (admin seeds). Report paywall must not fall back to these when a slot is hidden. */
export const BAZI_SINGLE_SKUS: Record<PlanType, string> = {
  basic: 'report-bazi-basic',
  advanced: 'report-bazi-advanced',
  premium: 'report-bazi-premium',
};

export const BAZI_COUPLE_SKUS: Record<PlanType, string> = {
  basic: 'report-bazi-couple-basic',
  advanced: 'report-bazi-couple-advanced',
  premium: 'report-bazi-couple-premium',
};

export const REPORT_SLOT_KEYS: Record<'single' | 'couple', Record<PlanType, string>> = {
  single: {
    basic: 'report.basic',
    advanced: 'report.advanced',
    premium: 'report.premium',
  },
  couple: {
    basic: 'report.couple.basic',
    advanced: 'report.couple.advanced',
    premium: 'report.couple.premium',
  },
};

export function baziSkusForMode(mode: 'single' | 'couple'): Record<PlanType, string> {
  return mode === 'couple' ? BAZI_COUPLE_SKUS : BAZI_SINGLE_SKUS;
}

export type PlanProductInfo = {
  type: PlanType;
  sku: string;
  name: string;
  desc: string;
  priceDisplay: string;
  highlight?: boolean;
};

type SlotProduct = {
  sku?: string;
  name?: string;
  desc?: string;
  description?: string;
  priceDisplay?: string;
};

export type BillingSlotRow = {
  sku: string;
  product?: SlotProduct | null;
  active?: boolean;
};

const PLAN_ORDER: PlanType[] = ['basic', 'advanced', 'premium'];

export function plansFromBillingSlots(
  mode: 'single' | 'couple',
  slots: Record<string, BillingSlotRow[]>,
): PlanProductInfo[] {
  const keys = REPORT_SLOT_KEYS[mode];
  const products: PlanProductInfo[] = [];
  for (const type of PLAN_ORDER) {
    const entries = slots[keys[type]] ?? [];
    const visible = entries.find((entry) => entry.active !== false && entry.product);
    if (!visible?.product) continue;
    const p = visible.product;
    products.push({
      type,
      sku: visible.sku,
      name: p.name ?? type,
      desc: p.desc ?? p.description ?? '',
      priceDisplay: p.priceDisplay ?? '',
      highlight: type === 'advanced',
    });
  }
  return products;
}

let cache: { mode: string; locale: string; products: PlanProductInfo[]; expiry: number } | null = null;

export function clearBaziPlanProductCache(): void {
  cache = null;
}

export async function fetchBaziPlanProducts(mode: 'single' | 'couple', locale = 'zh-CN'): Promise<PlanProductInfo[]> {
  if (cache && cache.mode === mode && cache.locale === locale && Date.now() < cache.expiry) {
    return cache.products;
  }

  try {
    const res = await fetch(
      `${AUTH_URL}/api/billing/slots?app=bazi&locale=${encodeURIComponent(locale)}`,
    );
    if (!res.ok) {
      cache = { mode, locale, products: [], expiry: Date.now() + 15_000 };
      return cache.products;
    }
    const data = await res.json() as { slots?: Record<string, BillingSlotRow[]> };
    const products = plansFromBillingSlots(mode, data.slots ?? {});
    cache = { mode, locale, products, expiry: Date.now() + 60_000 };
    return products;
  } catch {
    cache = { mode, locale, products: [], expiry: Date.now() + 15_000 };
    return cache.products;
  }
}

export async function resolveBaziPlanSku(
  mode: 'single' | 'couple',
  plan: PlanType,
): Promise<string | null> {
  const products = await fetchBaziPlanProducts(mode);
  return products.find((item) => item.type === plan)?.sku ?? null;
}

export function buildShopCheckoutUrl(params: {
  sku: string;
  returnUrl: string;
  readingId?: string;
  planType: PlanType;
  mode: 'single' | 'couple';
  context?: string;
}): string {
  const qs = new URLSearchParams({
    sku: params.sku,
    return: params.returnUrl,
    appSource: 'bazi',
    planType: params.planType,
  });
  if (params.readingId) qs.set('readingId', params.readingId);
  if (params.mode === 'couple') qs.set('shipping', 'couple');
  if (params.context) qs.set('context', params.context);
  return `${SHOP_URL}/checkout?${qs.toString()}`;
}
