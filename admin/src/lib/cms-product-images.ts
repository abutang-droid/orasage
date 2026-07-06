const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'https://admin.orasage.com/cms';

type CmsMedia = {
  url?: string | null;
};

type CmsProductImageRow = {
  sku: string;
  image?: CmsMedia | number | null;
};

function resolveMediaUrl(media: CmsMedia | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  const url = media.url;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${CMS_PUBLIC_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** 从 CMS 拉取 SKU → 主图 URL（运营后台预览用） */
export async function fetchAdminProductImageMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const res = await fetch(`${CMS_PUBLIC_URL}/api/shop-product-images?limit=500&depth=1`, {
      cache: 'no-store',
    });
    if (!res.ok) return map;
    const data = (await res.json()) as { docs?: CmsProductImageRow[] };
    for (const row of data.docs ?? []) {
      const url = resolveMediaUrl(row.image);
      if (row.sku && url) map.set(row.sku, url);
    }
  } catch {
    // CMS 不可用时静默降级
  }
  return map;
}
