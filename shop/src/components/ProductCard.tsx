'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { useShopCurrency } from '@/components/CurrencyProvider';
import { formatProductPrice } from '@/lib/currency';

const elementLabels: Record<string, string> = {
  '木': '木',
  '火': '火',
  '土': '土',
  '金': '金',
  '水': '水',
};

export function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currency } = useShopCurrency();

  async function handleBuy() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sku: product.sku, currency }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = data.loginUrl;
        return;
      }
      if (!res.ok) throw new Error(data.error || '购买失败');

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if ((data.provider === 'mock' || data.provider === 'demo') && data.orderNo) {
        const payRes = await fetch(`/api/pay?order=${encodeURIComponent(data.orderNo)}`, {
          method: 'POST',
          credentials: 'include',
        });
        const payData = await payRes.json();
        if (!payRes.ok) throw new Error(payData.error || '支付失败');
        window.location.href = `/success?order=${encodeURIComponent(data.orderNo)}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '购买失败');
    } finally {
      setLoading(false);
    }
  }

  const badgeLabel = product.element ? elementLabels[product.element] ?? product.element : '✦';

  return (
    <article className="shop-product-card">
      <span className="shop-product-badge">{badgeLabel}</span>
      <h3 className="shop-product-name">{product.name}</h3>
      <p className="shop-product-desc">{product.desc}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="shop-product-price">{formatProductPrice(product.priceCents, currency)}</span>
        <button
          type="button"
          onClick={handleBuy}
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
