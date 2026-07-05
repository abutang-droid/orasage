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

export type BaziRecommendProduct = {
  sku: string;
  name: string;
  desc: string;
  priceDisplay: string;
  priceCents: number;
  priceCentsUsd?: number | null;
  recommendPriceOverride?: boolean;
  element?: string;
};

type RecommendCache = {
  map: Record<string, string>;
  products: Record<string, BaziRecommendProduct | null>;
  expiry: number;
} | null;
let cache: RecommendCache = null;

async function loadRecommendData(): Promise<RecommendCache> {
  if (cache && Date.now() < cache.expiry) return cache;
  try {
    const res = await fetch(`${AUTH_URL}/api/products/recommend/bazi`);
    if (res.ok) {
      const data = await res.json() as {
        skuMap?: Record<string, string>;
        recommendations?: Record<string, BaziRecommendProduct | null>;
      };
      if (data.skuMap && Object.keys(data.skuMap).length > 0) {
        cache = {
          map: data.skuMap,
          products: data.recommendations ?? {},
          expiry: Date.now() + 60_000,
        };
        return cache;
      }
    }
  } catch { /* use defaults */ }
  cache = {
    map: ELEMENT_TO_SHOP_SKU,
    products: {},
    expiry: Date.now() + 30_000,
  };
  return cache;
}

export function shopCheckoutUrlForProduct(product: Pick<BaziRecommendProduct, 'sku' | 'priceCents' | 'priceCentsUsd' | 'recommendPriceOverride'>): string {
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
  return `${SHOP_BASE_URL}/checkout?${params.toString()}`;
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

export async function resolveRecommendProductForElement(element: string): Promise<BaziRecommendProduct | null> {
  const data = await loadRecommendData();
  const cached = data?.products[element];
  if (cached) return cached;
  try {
    const res = await fetch(`${AUTH_URL}/api/products/recommend/crystal?element=${encodeURIComponent(element)}`);
    if (!res.ok) return null;
    const body = await res.json() as { product?: BaziRecommendProduct };
    return body.product ?? null;
  } catch {
    return null;
  }
}

export async function resolveShopSkuForElement(element: string): Promise<string | undefined> {
  const data = await loadRecommendData();
  return data?.map[element];
}

export async function resolveShopUrlForElement(element: string): Promise<string> {
  const product = await resolveRecommendProductForElement(element);
  if (product) return shopCheckoutUrlForProduct(product);
  const data = await loadRecommendData();
  return shopUrlForElement(element, data?.map);
}

export function prefetchBaziRecommendSkus(): void {
  void loadRecommendData();
}
