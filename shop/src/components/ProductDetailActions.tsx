'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { useCart } from '@/lib/cart';

export function ProductDetailActions({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

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

  return (
    <div className="shop-pdp-actions shop-pdp-actions--row">
      <button
        type="button"
        onClick={handleAddToCart}
        className="shop-btn-secondary shop-pdp-action-btn"
      >
        {added ? '已加入购物车' : '加入购物车'}
      </button>
      <button
        type="button"
        onClick={() => void handleBuy()}
        disabled={loading}
        className="shop-btn-primary shop-pdp-action-btn"
      >
        {loading ? '处理中…' : '立即购买'}
      </button>
      {error && <p className="shop-pdp-error">{error}</p>}
    </div>
  );
}
