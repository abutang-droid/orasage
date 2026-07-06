'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addToCart,
  cartItemCount,
  CART_STORAGE_KEY,
  clearCart,
  parseCartState,
  removeFromCart,
  setCartQuantity,
  type CartState,
} from '../../../shared/shop-cart/index';

type CartContextValue = {
  cart: CartState;
  itemCount: number;
  addItem: (sku: string, quantity?: number) => void;
  removeItem: (sku: string) => void;
  setQuantity: (sku: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartState {
  if (typeof window === 'undefined') return { lines: [] };
  return parseCartState(localStorage.getItem(CART_STORAGE_KEY));
}

function persist(state: CartState) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({ lines: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persist(cart);
  }, [cart, hydrated]);

  const addItem = useCallback((sku: string, quantity = 1) => {
    setCart((prev) => addToCart(prev, sku, quantity));
  }, []);

  const removeItem = useCallback((sku: string) => {
    setCart((prev) => removeFromCart(prev, sku));
  }, []);

  const setQuantity = useCallback((sku: string, quantity: number) => {
    setCart((prev) => setCartQuantity(prev, sku, quantity));
  }, []);

  const clear = useCallback(() => {
    setCart(clearCart());
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    itemCount: cartItemCount(cart),
    addItem,
    removeItem,
    setQuantity,
    clear,
  }), [cart, addItem, removeItem, setQuantity, clear]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
