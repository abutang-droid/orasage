const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';
const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'https://admin.orasage.com/cms';

type CmsMedia = {
  url?: string | null;
  alt?: string | null;
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

let cachedMap: Map<string, string> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 15_000;

/** 从 CMS 拉取 SKU → 主图 URL 映射 */
export async function fetchProductImageMap(): Promise<Map<string, string>> {
  if (cachedMap && Date.now() < cacheExpiry) {
    return cachedMap;
  }

  const map = new Map<string, string>();
  try {
    const res = await fetch(
      `${CMS_INTERNAL_URL}/api/shop-product-images?limit=200&depth=1`,
      { next: { revalidate: 15 } } as RequestInit,
    );
    if (!res.ok) return map;
    const data = (await res.json()) as { docs?: CmsProductImageRow[] };
    for (const row of data.docs ?? []) {
      const url = resolveMediaUrl(row.image);
      if (row.sku && url) map.set(row.sku, url);
    }
    cachedMap = map;
    cacheExpiry = Date.now() + CACHE_TTL_MS;
  } catch {
    // CMS 不可用时返回空映射，前台使用分类占位图
  }
  return map;
}

export async function getProductImageUrl(sku: string): Promise<string | null> {
  const map = await fetchProductImageMap();
  return map.get(sku) ?? null;
}

const CRYSTAL_ELEMENT_PLACEHOLDERS = new Set([
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
]);

/** 分类占位图（无 CMS 主图时）；五行水晶有专属能量占位图 */
export function fallbackProductImageUrl(sku: string, category?: string): string {
  const baseSku = sku.endsWith('-gift') ? sku.slice(0, -'-gift'.length) : sku;
  if (CRYSTAL_ELEMENT_PLACEHOLDERS.has(baseSku)) {
    return `/product-placeholders/${baseSku}.svg`;
  }
  const cat = category ?? (sku.startsWith('crystal') ? 'crystal' : sku.startsWith('report') ? 'report' : 'service');
  return `/product-placeholders/${cat}.svg`;
}
