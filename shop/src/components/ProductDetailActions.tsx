'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@orasage/ui/button';
import type { Product } from '@/lib/products';
import { useCart } from '@/lib/cart';
import { PRODUCT_SKU_TO_BEAD_MATERIAL } from '@/lib/diy';

export function ProductDetailActions({ product }: { product: Product }) {
  const t = useTranslations('product');
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

      if (!res.ok) throw new Error(data.error || t('buyFailed'));

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.orderNo) {
        window.location.href = `/checkout?order=${encodeURIComponent(data.orderNo)}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('buyFailed'));
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    addItem(product.sku);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  const diyBase = PRODUCT_SKU_TO_BEAD_MATERIAL[product.sku] ? product.sku : null;

  return (
    <div className="shop-pdp-actions shop-pdp-actions--row">
      {diyBase ? (
        <Button asChild className="shop-pdp-action-btn shop-pdp-action-btn--diy flex-1 px-2 sm:px-4">
          <Link href={`/diy?base=${encodeURIComponent(diyBase)}`}>✦ {t('customBracelet')}</Link>
        </Button>
      ) : null}
      <Button
        type="button"
        variant={diyBase ? 'outline' : 'secondary'}
        onClick={handleAddToCart}
        className="shop-pdp-action-btn flex-1 px-2 sm:px-4"
      >
        {added ? t('addedToCart') : t('addToCartFull')}
      </Button>
      <Button
        type="button"
        variant={diyBase ? 'secondary' : 'default'}
        onClick={() => void handleBuy()}
        disabled={loading}
        loading={loading}
        className="shop-pdp-action-btn flex-1 px-2 sm:px-4"
      >
        {loading ? t('buying') : t('buyNow')}
      </Button>
      {error && <p className="shop-pdp-error">{error}</p>}
    </div>
  );
}
