export const TAROT_REPORT_SKU = 'report-tarot';

export type TarotReportProduct = {
  sku: string;
  name: string;
  desc: string;
  priceDisplay: string;
};

const FALLBACK: TarotReportProduct = {
  sku: TAROT_REPORT_SKU,
  name: '塔罗深度解读',
  desc: '牌阵详解 · 行动建议',
  priceDisplay: '¥48.00',
};

export async function fetchTarotReportProduct(locale = 'zh-CN'): Promise<TarotReportProduct> {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || process.env.AUTH_URL || 'https://auth.orasage.com';
  try {
    const res = await fetch(
      `${authUrl}/api/products/${encodeURIComponent(TAROT_REPORT_SKU)}?locale=${encodeURIComponent(locale)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as {
      product?: { name?: string; desc?: string; description?: string; priceDisplay?: string };
    };
    const p = data.product;
    if (!p?.name) return FALLBACK;
    return {
      sku: TAROT_REPORT_SKU,
      name: p.name,
      desc: p.desc ?? p.description ?? FALLBACK.desc,
      priceDisplay: p.priceDisplay ?? FALLBACK.priceDisplay,
    };
  } catch {
    return FALLBACK;
  }
}
