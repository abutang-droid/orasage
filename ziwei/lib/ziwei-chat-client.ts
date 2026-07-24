const AUTH_URL = process.env.AUTH_URL || process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';

export type ZiweiChatQuota = {
  freePerReading: number;
  freeUsed: number;
  freeRemaining: number;
  packCredits: number;
  yearlyActive: boolean;
  yearlyExpiresAt: string | null;
  canAsk: boolean;
  requiresPayment: boolean;
};

export async function fetchZiweiChatQuota(readingId: string): Promise<ZiweiChatQuota | null> {
  const res = await fetch(
    `${AUTH_URL}/api/ziwei/chat/quota?readingId=${encodeURIComponent(readingId)}`,
    { credentials: 'include', cache: 'no-store' },
  );
  if (res.status === 401) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as { quota: ZiweiChatQuota };
  return data.quota;
}

export type ZiweiChatProduct = {
  type: 'pack' | 'yearly';
  sku: string;
  name: string;
  desc: string;
  priceDisplay: string;
};

/** 问答加量商品已从商城下架；仅当 auth 仍有对应 SKU 时才展示购买入口 */
const CHAT_PRODUCT_SKUS: Array<{ type: 'pack' | 'yearly'; sku: string }> = [
  { type: 'pack', sku: 'ziwei-chat-pack-10' },
  { type: 'yearly', sku: 'ziwei-chat-yearly' },
];

export async function fetchZiweiChatProducts(locale = 'zh-CN'): Promise<ZiweiChatProduct[]> {
  const plans = await Promise.all(
    CHAT_PRODUCT_SKUS.map(async ({ type, sku }) => {
      try {
        const res = await fetch(
          `${AUTH_URL}/api/products/${encodeURIComponent(sku)}?locale=${encodeURIComponent(locale)}`,
          { cache: 'no-store' },
        );
        if (!res.ok) return null;
        const data = (await res.json()) as {
          product: { name: string; desc?: string; description?: string; priceDisplay?: string };
        };
        const p = data.product;
        return {
          type,
          sku,
          name: p.name,
          desc: p.desc ?? p.description ?? '',
          priceDisplay: p.priceDisplay ?? '',
        } satisfies ZiweiChatProduct;
      } catch {
        return null;
      }
    }),
  );
  return plans.filter((p): p is ZiweiChatProduct => p != null);
}

import type { ZiweiChart } from '@/lib/ziwei/types';

export type RecommendProduct = {
  sku: string;
  name: string;
  desc: string;
  priceDisplay: string;
};

export async function fetchZiweiRecommendProduct(chart: ZiweiChart): Promise<RecommendProduct | null> {
  try {
    const { birthInfo, wuxingJuName } = chart;
    const res = await fetch('/api/recommend/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        year: birthInfo.year,
        month: birthInfo.month,
        day: birthInfo.day,
        hour: birthInfo.hour,
        gender: birthInfo.gender,
        name: birthInfo.name,
        city: birthInfo.city,
        wuxingJuName,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { product: RecommendProduct };
    return data.product;
  } catch {
    return null;
  }
}
