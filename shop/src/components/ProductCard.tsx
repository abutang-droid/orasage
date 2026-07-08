'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@orasage/ui/button';
import type { Product } from '@/lib/products';
import { useShopLocale } from '@/components/ShopLocaleProvider';
import { formatShopPrice, resolvePriceCents } from '@/lib/currency';
import { useCart } from '@/lib/cart';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const { currency } = useShopLocale();
  const { addItem } = useCart();

  const displayCents = product.priceCentsResolved
    ?? resolvePriceCents(
      { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
      currency,
    );
  const displayPrice = product.priceDisplay ?? formatShopPrice(displayCents, currency);

  async function handleBuy() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sku: product.sku }),
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = `/checkout?sku=${encodeURIComponent(product.sku)}`;
        return;
      }

      if (!res.ok) throw new Error(data.error || '购买失败');

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.orderNo) {
        window.location.href = `/checkout?order=${encodeURIComponent(data.orderNo)}`;
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '购买失败');
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    addItem(product.sku);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  const badgeLabel = product.element ?? '✦';

  return (
    <article className="shop-product-card">
      <Link href={`/product/${encodeURIComponent(product.sku)}`} className="shop-product-card-link">
        <ProductImage
          sku={product.sku}
          name={product.name}
          category={product.category}
          imageUrl={product.imageUrl}
        />
        <span className="shop-product-badge">{badgeLabel}</span>
        <h3 className="shop-product-name">{product.name}</h3>
        <p className="shop-product-desc">{product.desc}</p>
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="shop-product-price">{displayPrice}</span>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={() => void handleBuy()}
          disabled={loading}
          loading={loading}
          className="flex-1"
        >
          {loading ? '处理中…' : '购买'}
        </Button>
        <Button type="button" variant="secondary" onClick={handleAddToCart} className="flex-1">
          {added ? '已加入' : '加购'}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </article>
  );
}
