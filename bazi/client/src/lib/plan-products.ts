import type { PlanType } from '@shared/types';

const AUTH_URL = (import.meta.env.VITE_AUTH_URL as string | undefined) || 'https://auth.orasage.com';
const SHOP_URL = (import.meta.env.VITE_SHOP_URL as string | undefined) || 'https://shop.orasage.com';

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

type ApiProduct = {
  sku: string;
  name: string;
  desc?: string;
  description?: string;
  priceDisplay?: string;
};

let cache: { mode: string; locale: string; products: PlanProductInfo[]; expiry: number } | null = null;

export async function fetchBaziPlanProducts(mode: 'single' | 'couple', locale = 'zh-CN'): Promise<PlanProductInfo[]> {
  if (cache && cache.mode === mode && cache.locale === locale && Date.now() < cache.expiry) {
    return cache.products;
  }

  const skus = baziSkusForMode(mode);
  const plans: PlanType[] = ['basic', 'advanced', 'premium'];

  const products = await Promise.all(plans.map(async (type) => {
    const sku = skus[type];
    try {
      const res = await fetch(`${AUTH_URL}/api/products/${encodeURIComponent(sku)}?locale=${encodeURIComponent(locale)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { product: ApiProduct };
      const p = data.product;
      return {
        type,
        sku,
        name: p.name,
        desc: p.desc ?? p.description ?? '',
        priceDisplay: p.priceDisplay ?? '',
        highlight: type === 'advanced',
      } satisfies PlanProductInfo;
    } catch {
      return {
        type,
        sku,
        name: type,
        desc: '',
        priceDisplay: '',
        highlight: type === 'advanced',
      } satisfies PlanProductInfo;
    }
  }));

  cache = { mode, locale, products, expiry: Date.now() + 60_000 };
  return products;
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
