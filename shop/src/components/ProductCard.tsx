'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { useShopLocale } from '@/components/ShopLocaleProvider';
import { formatShopPrice, resolvePriceCents } from '@/lib/currency';

export function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currency } = useShopLocale();

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

  const badgeLabel = product.element ?? '✦';

  return (
    <article className="shop-product-card">
      <span className="shop-product-badge">{badgeLabel}</span>
      <h3 className="shop-product-name">{product.name}</h3>
      <p className="shop-product-desc">{product.desc}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="shop-product-price">{displayPrice}</span>
        <button
          type="button"
          onClick={() => void handleBuy()}
          disabled={loading}
          className="shop-btn-primary"
        >
          {loading ? '处理中…' : '购买'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </article>
  );
}
