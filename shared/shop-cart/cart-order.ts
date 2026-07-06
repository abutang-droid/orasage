/** 购物车合并订单在 user_orders.sku 上的标记值 */
export const SHOP_CART_ORDER_SKU = 'shop-cart';

export type CartOrderLine = {
  sku: string;
  quantity: number;
  name: string;
};

export type CartOrderContext = {
  type: 'shop_cart';
  items: CartOrderLine[];
};

export function encodeCartOrderContext(items: CartOrderLine[]): string {
  const payload: CartOrderContext = { type: 'shop_cart', items };
  return JSON.stringify(payload);
}

export function parseCartOrderContext(raw: string | null | undefined): CartOrderContext | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CartOrderContext>;
    if (parsed.type !== 'shop_cart' || !Array.isArray(parsed.items)) return null;
    const items = parsed.items.filter(
      (line): line is CartOrderLine =>
        Boolean(line)
        && typeof line.sku === 'string'
        && typeof line.quantity === 'number'
        && line.quantity > 0
        && typeof line.name === 'string',
    );
    if (items.length === 0) return null;
    return { type: 'shop_cart', items };
  } catch {
    return null;
  }
}

export function isCartOrder(order: { sku?: string | null; recommendationContext?: string | null }): boolean {
  if (order.sku === SHOP_CART_ORDER_SKU) return true;
  return parseCartOrderContext(order.recommendationContext) !== null;
}

/** 订单列表/详情展示用：购物车订单显示商品名称，不暴露 SKU / JSON */
export function formatOrderProductTitle(order: {
  title: string;
  sku?: string | null;
  recommendationContext?: string | null;
}): string {
  const cart = parseCartOrderContext(order.recommendationContext);
  if (cart?.items.length) {
    return cart.items
      .map((item) => (item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name))
      .join('、');
  }
  return order.title;
}
