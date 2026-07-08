'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart';

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="shop-cart-link" aria-label={`购物车，${itemCount} 件商品`}>
      <ShoppingCart className="shop-cart-link-icon" size={20} strokeWidth={1.75} aria-hidden />
      {itemCount > 0 && (
        <span className="shop-cart-link-badge">{itemCount > 99 ? '99+' : itemCount}</span>
      )}
    </Link>
  );
}
