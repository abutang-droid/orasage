import type { ReportProductRecommend } from './reportHtml.ts';
import {
  billingSlotKeyForElement,
  buildBaziChartRecommendSeed,
  deficientWuXingElement,
} from '../../shared/recommend-seed/index.ts';

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

export { deficientWuXingElement };

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

export type BaziChartRecommendContext = {
  birthStr: string;
  gender: string;
  name?: string;
};

export function buildBaziRecommendSeed(
  wuXing: Record<string, number>,
  chart?: BaziChartRecommendContext,
): string | undefined {
  if (!chart?.birthStr) return undefined;
  return buildBaziChartRecommendSeed({
    birthStr: chart.birthStr,
    gender: chart.gender,
    name: chart.name,
    wuXing,
  });
}

/** 八字报告饰品推荐：槽位按结论五行，seed 按命盘信息（非账号） */
export async function fetchReportProductRecommend(
  wuXing: Record<string, number> | undefined,
  options?: {
    locale?: string;
    chart?: BaziChartRecommendContext;
  },
): Promise<ReportProductRecommend | null> {
  if (!wuXing) return null;
  const element = deficientWuXingElement(wuXing);
  if (!element) return null;
  const slotKey = billingSlotKeyForElement(element);
  if (!slotKey) return null;
  const locale = options?.locale ?? 'zh-CN';
  const chartSeed = buildBaziRecommendSeed(wuXing, options?.chart);
  try {
    const url = new URL(`${AUTH_PUBLIC}/api/billing/slot`);
    url.searchParams.set('app', 'bazi');
    url.searchParams.set('key', slotKey);
    url.searchParams.set('locale', locale);
    if (chartSeed) url.searchParams.set('seed', chartSeed);
    const res = await fetch(url.toString());
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
