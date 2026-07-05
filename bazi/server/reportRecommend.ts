import type { ReportProductRecommend } from './reportHtml.ts';

const AUTH_PUBLIC = process.env.AUTH_PUBLIC_URL ?? process.env.AUTH_URL ?? 'https://auth.orasage.com';
const SHOP_URL = process.env.SHOP_URL ?? 'https://shop.orasage.com';

type RecommendProduct = {
  sku: string;
  name: string;
  desc?: string;
  description?: string;
  priceDisplay: string;
  priceCents: number;
  priceCentsUsd?: number | null;
  recommendPriceOverride?: boolean;
};

export function deficientWuXingElement(wuXing: Record<string, number>): string | null {
  const entries = Object.entries(wuXing).filter(([, v]) => Number.isFinite(v));
  if (entries.length === 0) return null;
  let minWx = entries[0][0];
  let minCount = entries[0][1];
  for (const [wx, count] of entries) {
    if (count < minCount) {
      minWx = wx;
      minCount = count;
    }
  }
  return minWx;
}

export function shopCheckoutUrlForRecommend(product: RecommendProduct): string {
  const params = new URLSearchParams({
    sku: product.sku,
    appSource: 'bazi',
  });
  if (product.recommendPriceOverride) {
    params.set('priceCents', String(product.priceCents));
    if (product.priceCentsUsd != null) {
      params.set('priceCentsUsd', String(product.priceCentsUsd));
    }
  }
  return `${SHOP_URL}/checkout?${params.toString()}`;
}

export async function fetchReportProductRecommend(
  wuXing: Record<string, number> | undefined,
  locale = 'zh-CN',
): Promise<ReportProductRecommend | null> {
  if (!wuXing) return null;
  const element = deficientWuXingElement(wuXing);
  if (!element) return null;
  try {
    const res = await fetch(
      `${AUTH_PUBLIC}/api/products/recommend/crystal?element=${encodeURIComponent(element)}&locale=${encodeURIComponent(locale)}`,
    );
    if (!res.ok) return null;
    const data = await res.json() as { product?: RecommendProduct };
    const product = data.product;
    if (!product?.sku) return null;
    return {
      element,
      name: product.name,
      desc: product.desc ?? product.description ?? '',
      priceDisplay: product.priceDisplay,
      shopUrl: shopCheckoutUrlForRecommend(product),
    };
  } catch {
    return null;
  }
}
