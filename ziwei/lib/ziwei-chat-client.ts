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

const FALLBACK_PRODUCTS: ZiweiChatProduct[] = [
  {
    type: 'pack',
    sku: 'ziwei-chat-pack-10',
    name: '问答加量包',
    desc: '额外 10 次 Orasage 对话（账户内跨排盘累积）',
    priceDisplay: '¥9.90',
  },
  {
    type: 'yearly',
    sku: 'ziwei-chat-yearly',
    name: '问答年卡',
    desc: '365 天无限 Orasage 对话',
    priceDisplay: '¥99.00',
  },
];

export async function fetchZiweiChatProducts(locale = 'zh-CN'): Promise<ZiweiChatProduct[]> {
  const plans = await Promise.all(
    FALLBACK_PRODUCTS.map(async (fallback) => {
      try {
        const res = await fetch(
          `${AUTH_URL}/api/products/${encodeURIComponent(fallback.sku)}?locale=${encodeURIComponent(locale)}`,
          { cache: 'no-store' },
        );
        if (!res.ok) return fallback;
        const data = (await res.json()) as { product: { name: string; desc?: string; description?: string; priceDisplay?: string } };
        const p = data.product;
        return {
          ...fallback,
          name: p.name,
          desc: p.desc ?? p.description ?? fallback.desc,
          priceDisplay: p.priceDisplay ?? fallback.priceDisplay,
        };
      } catch {
        return fallback;
      }
    }),
  );
  return plans;
}

export type RecommendProduct = {
  sku: string;
  name: string;
  desc: string;
  priceDisplay: string;
};

export async function fetchZiweiRecommendProduct(readingId: string): Promise<RecommendProduct | null> {
  try {
    const res = await fetch(
      `/api/recommend/product?readingId=${encodeURIComponent(readingId)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { product: RecommendProduct };
    return data.product;
  } catch {
    return null;
  }
}
