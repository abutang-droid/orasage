'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { formatPrice } from '@/lib/products';

const elementColors: Record<string, string> = {
  '木': 'bg-emerald-500/20 text-emerald-300',
  '火': 'bg-red-500/20 text-red-300',
  '土': 'bg-amber-500/20 text-amber-300',
  '金': 'bg-slate-400/20 text-slate-200',
  '水': 'bg-indigo-500/20 text-indigo-300',
};

export function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        window.location.href = data.loginUrl;
        return;
      }
      if (!res.ok) throw new Error(data.error || '购买失败');

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.provider === 'demo' && data.orderNo) {
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

  return (
    <article className="flex flex-col rounded-2xl border border-sage-border bg-sage-card p-4">
      {product.element && (
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${elementColors[product.element] ?? 'bg-sage-gold/15 text-sage-gold'}`}
        >
          {product.element}
        </span>
      )}
      {!product.element && (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage-gold/15 text-sm text-sage-gold">
          ✦
        </span>
      )}
      <h3 className="mt-3 text-base font-medium text-sage-primary">{product.name}</h3>
      <p className="mt-1 flex-1 text-xs text-sage-muted">{product.desc}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-lg font-medium text-sage-gold">{formatPrice(product.priceCents)}</span>
        <button
          type="button"
          onClick={handleBuy}
          disabled={loading}
          className="min-h-[44px] rounded-full bg-sage-gold/15 px-4 text-sm font-medium text-sage-gold active:bg-sage-gold/25 disabled:opacity-50"
        >
          {loading ? '处理中…' : '购买'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </article>
  );
}
