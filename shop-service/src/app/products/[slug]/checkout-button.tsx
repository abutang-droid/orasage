'use client';

import { useState } from 'react';

export function CheckoutButton({ productId }: { productId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: [{ productId, quantity: 1 }],
          sourceApp: 'shop',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '结账失败');
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '结账失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? '处理中…' : '立即购买'}
      </button>
      {error && (
        <p style={{ color: '#ff6b6b', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>
      )}
    </div>
  );
}
