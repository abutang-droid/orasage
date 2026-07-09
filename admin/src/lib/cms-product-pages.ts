export type ProductPageStatus = 'published' | 'draft' | 'none';

export async function fetchCmsProductPageStatusMap(): Promise<Map<string, ProductPageStatus>> {
  const CMS_INTERNAL_URL =
    process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';
  const map = new Map<string, ProductPageStatus>();

  try {
    const params = new URLSearchParams({
      'where[locale][equals]': 'zh-CN',
      limit: '500',
      depth: '0',
    });
    const res = await fetch(`${CMS_INTERNAL_URL}/api/shop-product-pages?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return map;
    const data = (await res.json()) as {
      docs?: Array<{ sku?: string; status?: 'draft' | 'published' }>;
    };
    for (const doc of data.docs ?? []) {
      if (!doc.sku) continue;
      map.set(doc.sku, doc.status === 'published' ? 'published' : 'draft');
    }
  } catch {
    /* CMS unavailable */
  }
  return map;
}

export function productPageStatusLabel(status: ProductPageStatus): string {
  if (status === 'published') return '已发布';
  if (status === 'draft') return '草稿';
  return '未配置';
}
