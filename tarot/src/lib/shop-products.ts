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

export const SHOP_BASE_URL = 'https://shop.orasage.com';

export function shopUrlForWuxing(wuxing: string): string {
  const sku = ELEMENT_TO_SHOP_SKU[wuxing];
  return sku ? `${SHOP_BASE_URL}?sku=${encodeURIComponent(sku)}` : SHOP_BASE_URL;
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
    const res = await fetch(`${SHOP_BASE_URL}/api/products`, { next: { revalidate: 60 } } as RequestInit);
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
