import { buildBaziChartRecommendSeed } from '../../../../shared/recommend-seed/index.ts';

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

export type BaziChartRecommendContext = {
  birthStr: string;
  gender: string;
  name?: string;
  wuXing: Record<string, number>;
};

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

const SLOT_CODE_TO_ELEMENT: Record<string, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

const ELEMENT_TO_SLOT_CODE: Record<string, string> = {
  木: 'wood',
  火: 'fire',
  土: 'earth',
  金: 'metal',
  水: 'water',
};

type BillingSlotsResponse = {
  slots?: Record<string, Array<{ sku: string; product?: BaziRecommendProduct | null }>>;
};

async function loadRecommendData(): Promise<RecommendCache> {
  if (cache && Date.now() < cache.expiry) return cache;
  try {
    const res = await fetch(`${AUTH_URL}/api/billing/slots?app=bazi`);
    if (res.ok) {
      const data = await res.json() as BillingSlotsResponse;
      const map: Record<string, string> = {};
      const products: Record<string, BaziRecommendProduct | null> = {};
      for (const [key, entries] of Object.entries(data.slots ?? {})) {
        const code = key.startsWith('recommend.element.') ? key.slice('recommend.element.'.length) : null;
        const element = code ? SLOT_CODE_TO_ELEMENT[code] : undefined;
        if (!element || !entries[0]) continue;
        map[element] = entries[0].sku;
        products[element] = entries[0].product ?? null;
      }
      if (Object.keys(map).length > 0) {
        cache = { map, products, expiry: Date.now() + 60_000 };
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

export async function resolveRecommendProductForElement(
  element: string,
  chart?: BaziChartRecommendContext,
): Promise<BaziRecommendProduct | null> {
  const data = await loadRecommendData();
  const slotCode = ELEMENT_TO_SLOT_CODE[element];
  if (!slotCode) return null;

  const chartSeed = chart?.birthStr
    ? buildBaziChartRecommendSeed({
        birthStr: chart.birthStr,
        gender: chart.gender,
        name: chart.name,
        wuXing: chart.wuXing,
      })
    : undefined;

  if (!chartSeed) {
    const cached = data?.products[element];
    if (cached) return cached;
  }

  try {
    const url = new URL(`${AUTH_URL}/api/billing/slot`);
    url.searchParams.set('app', 'bazi');
    url.searchParams.set('key', `recommend.element.${slotCode}`);
    if (chartSeed) url.searchParams.set('seed', chartSeed);
    const res = await fetch(url.toString());
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
