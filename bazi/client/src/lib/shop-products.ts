/** 五行 → 统一商城 SKU（与 auth-service products 表一致） */
export const ELEMENT_TO_SHOP_SKU: Record<string, string> = {
  木: 'crystal-wood',
  火: 'crystal-fire',
  土: 'crystal-earth',
  金: 'crystal-metal',
  水: 'crystal-water',
};

export const SHOP_BASE_URL = 'https://shop.orasage.com';

export function shopUrlForElement(element: string): string {
  const sku = ELEMENT_TO_SHOP_SKU[element];
  return sku ? `${SHOP_BASE_URL}?sku=${encodeURIComponent(sku)}` : SHOP_BASE_URL;
}

export function shopSkuForElement(element: string): string | undefined {
  return ELEMENT_TO_SHOP_SKU[element];
}
