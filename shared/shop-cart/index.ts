/** 商城购物车 localStorage 键（游客与登录用户共用，登录后可在结账前合并） */
export const CART_STORAGE_KEY = 'orasage_shop_cart_v1';

export type CartLine = {
  sku: string;
  quantity: number;
  addedAt: number;
};

export type CartState = {
  lines: CartLine[];
};

export const EMPTY_CART: CartState = { lines: [] };

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false;
  const line = value as CartLine;
  return typeof line.sku === 'string'
    && typeof line.quantity === 'number'
    && line.quantity > 0
    && typeof line.addedAt === 'number';
}

export function parseCartState(raw: string | null): CartState {
  if (!raw) return { ...EMPTY_CART };
  try {
    const parsed = JSON.parse(raw) as { lines?: unknown };
    if (!Array.isArray(parsed.lines)) return { ...EMPTY_CART };
    const lines = parsed.lines.filter(isCartLine);
    return { lines };
  } catch {
    return { ...EMPTY_CART };
  }
}

export function cartItemCount(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function addToCart(state: CartState, sku: string, quantity = 1): CartState {
  const qty = Math.min(10, Math.max(1, Math.floor(quantity)));
  const existing = state.lines.find((l) => l.sku === sku);
  if (existing) {
    return {
      lines: state.lines.map((l) => (
        l.sku === sku
          ? { ...l, quantity: Math.min(10, l.quantity + qty) }
          : l
      )),
    };
  }
  return {
    lines: [...state.lines, { sku, quantity: qty, addedAt: Date.now() }],
  };
}

export function removeFromCart(state: CartState, sku: string): CartState {
  return { lines: state.lines.filter((l) => l.sku !== sku) };
}

export function setCartQuantity(state: CartState, sku: string, quantity: number): CartState {
  const qty = Math.floor(quantity);
  if (qty <= 0) return removeFromCart(state, sku);
  return {
    lines: state.lines.map((l) => (
      l.sku === sku ? { ...l, quantity: Math.min(10, qty) } : l
    )),
  };
}

export function clearCart(): CartState {
  return { ...EMPTY_CART };
}
