export interface ShopCatalogItem {
  sku: string;
  name: string;
  element?: string;
  priceDisplay: string;
  shopUrl: string;
}

const ELEMENT_KEYS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
const ELEMENT_TO_SKU: Record<(typeof ELEMENT_KEYS)[number], string> = {
  wood: 'crystal-wood',
  fire: 'crystal-fire',
  earth: 'crystal-earth',
  metal: 'crystal-metal',
  water: 'crystal-water',
};

const ELEMENT_TO_WUXING: Record<(typeof ELEMENT_KEYS)[number], string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

export async function fetchShopCatalog(): Promise<ShopCatalogItem[]> {
  const shopUrl = process.env.SHOP_URL ?? 'https://shop.orasage.com';
  try {
    const res = await fetch(`${shopUrl}/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`shop API ${res.status}`);
    const data = await res.json() as {
      products: Array<{ sku: string; name: string; element?: string; priceDisplay: string; shopUrl?: string }>;
    };
    const bySku = new Map(data.products.map((p) => [p.sku, p]));
    return ELEMENT_KEYS.map((key) => {
      const sku = ELEMENT_TO_SKU[key];
      const p = bySku.get(sku);
      return {
        sku,
        name: p?.name ?? sku,
        element: ELEMENT_TO_WUXING[key],
        priceDisplay: p?.priceDisplay ?? '',
        shopUrl: p?.shopUrl ?? `${shopUrl}?sku=${sku}`,
      };
    });
  } catch {
    return ELEMENT_KEYS.map((key) => ({
      sku: ELEMENT_TO_SKU[key],
      name: ELEMENT_TO_SKU[key],
      element: ELEMENT_TO_WUXING[key],
      priceDisplay: '',
      shopUrl: `${shopUrl}?sku=${ELEMENT_TO_SKU[key]}`,
    }));
  }
}
