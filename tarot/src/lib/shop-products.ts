import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

/** 五行 → 统一商城 SKU */
export const ELEMENT_TO_SHOP_SKU: Record<string, string> = {
  木: 'crystal-wood',
  火: 'crystal-fire',
  土: 'crystal-earth',
  金: 'crystal-metal',
  水: 'crystal-water',
};

/** 塔罗元素（风→木）映射 */
export const TAROT_ELEMENT_TO_WUXING: Record<string, string> = {
  风: '木',
  火: '火',
  土: '土',
  金: '金',
  水: '水',
  major: '金',
  大阿卡纳: '金',
};

export function getShopBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SHOP_URL || ORASAGE_URLS.shop;
}

/** 商城首页定位到指定 SKU（高亮并滚动到对应商品卡片） */
export function shopUrlForSku(sku: string): string {
  const encoded = encodeURIComponent(sku);
  return `${getShopBaseUrl()}?sku=${encoded}#${encoded}`;
}

export function shopUrlForWuxing(wuxing: string): string {
  const sku = ELEMENT_TO_SHOP_SKU[wuxing];
  return sku ? shopUrlForSku(sku) : getShopBaseUrl();
}

export function shopUrlForTarotElement(element: string): string {
  const wuxing = TAROT_ELEMENT_TO_WUXING[element] ?? element;
  return shopUrlForWuxing(wuxing);
}

export interface ShopProduct {
  sku: string;
  name: string;
  priceCents: number;
  priceDisplay: string;
  element?: string;
}

export async function fetchCrystalProducts(): Promise<ShopProduct[]> {
  try {
    const res = await fetch(`${getShopBaseUrl()}/api/products`, { next: { revalidate: 60 } } as RequestInit);
    if (!res.ok) return [];
    const data = await res.json() as { products: ShopProduct[] };
    return data.products.filter((p) => p.sku.startsWith('crystal-'));
  } catch {
    return [];
  }
}

export function findProductByWuxing(products: ShopProduct[], wuxing: string): ShopProduct | undefined {
  const sku = ELEMENT_TO_SHOP_SKU[wuxing];
  return products.find((p) => p.sku === sku);
}
