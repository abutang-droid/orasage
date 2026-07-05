const AUTH_URL = (import.meta.env.VITE_AUTH_URL as string | undefined) || 'https://auth.orasage.com';
const SHOP_URL = (import.meta.env.VITE_SHOP_URL as string | undefined) || 'https://shop.orasage.com';

/** 五行 → 商城 SKU 默认映射（后台未配置时的回退） */
export const ELEMENT_TO_SHOP_SKU: Record<string, string> = {
  木: 'crystal-wood',
  火: 'crystal-fire',
  土: 'crystal-earth',
  金: 'crystal-metal',
  水: 'crystal-water',
};

export const SHOP_BASE_URL = SHOP_URL;

type RecommendCache = { map: Record<string, string>; expiry: number } | null;
let cache: RecommendCache = null;

async function loadElementSkuMap(): Promise<Record<string, string>> {
  if (cache && Date.now() < cache.expiry) return cache.map;
  try {
    const res = await fetch(`${AUTH_URL}/api/products/recommend/bazi`);
    if (res.ok) {
      const data = await res.json() as { skuMap?: Record<string, string> };
      if (data.skuMap && Object.keys(data.skuMap).length > 0) {
        cache = { map: data.skuMap, expiry: Date.now() + 60_000 };
        return data.skuMap;
      }
    }
  } catch { /* use defaults */ }
  cache = { map: ELEMENT_TO_SHOP_SKU, expiry: Date.now() + 30_000 };
  return ELEMENT_TO_SHOP_SKU;
}

export function shopUrlForElement(element: string, skuMap?: Record<string, string>): string {
  const map = skuMap ?? ELEMENT_TO_SHOP_SKU;
  const sku = map[element];
  return sku ? `${SHOP_BASE_URL}/checkout?sku=${encodeURIComponent(sku)}&appSource=bazi` : SHOP_BASE_URL;
}

export function shopSkuForElement(element: string, skuMap?: Record<string, string>): string | undefined {
  const map = skuMap ?? ELEMENT_TO_SHOP_SKU;
  return map[element];
}

/** 异步解析后台配置的五行推荐 SKU */
export async function resolveShopSkuForElement(element: string): Promise<string | undefined> {
  const map = await loadElementSkuMap();
  return map[element];
}

export async function resolveShopUrlForElement(element: string): Promise<string> {
  const map = await loadElementSkuMap();
  return shopUrlForElement(element, map);
}

export function prefetchBaziRecommendSkus(): void {
  void loadElementSkuMap();
}
