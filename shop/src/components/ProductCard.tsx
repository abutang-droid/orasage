'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { Button } from '@orasage/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@orasage/ui/card';
import type { Product } from '@/lib/products';
import { useShopLocale } from '@/components/ShopLocaleProvider';
import { formatShopPrice, resolvePriceCents } from '@/lib/currency';
import { useCart } from '@/lib/cart';
import { ProductImage } from './ProductImage';

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('product');
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

      if (!res.ok) throw new Error(data.error || t('buyFailed'));

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.orderNo) {
        window.location.href = `/checkout?order=${encodeURIComponent(data.orderNo)}`;
        return;
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

  const badgeLabel = product.element;

  return (
    <Card variant="interactive" className="flex h-full flex-col p-3 shadow-none">
      <Link href={`/product/${encodeURIComponent(product.sku)}`} className="shop-product-card-link">
        <ProductImage
          sku={product.sku}
          name={product.name}
          category={product.category}
          imageUrl={product.imageUrl}
        />
        <span className="shop-product-badge">
          {badgeLabel ?? <Sparkles size={12} strokeWidth={1.8} aria-hidden />}
        </span>
        <CardTitle className="shop-product-name text-base font-semibold leading-snug">
          {product.name}
        </CardTitle>
        <CardDescription className="shop-product-desc line-clamp-2">
          {product.desc}
        </CardDescription>
      </Link>
      <CardContent className="mt-3 flex items-center justify-between gap-2 p-0">
        <span className="shop-product-price">{displayPrice}</span>
      </CardContent>
      <CardFooter className="mt-3 flex flex-col gap-2 p-0 sm:flex-row">
        <Button
          type="button"
          onClick={() => void handleBuy()}
          disabled={loading}
          loading={loading}
          className="flex-1"
        >
          {loading ? t('buying') : t('buy')}
        </Button>
        <Button type="button" variant="secondary" onClick={handleAddToCart} className="flex-1">
          {added ? t('added') : t('addToCart')}
        </Button>
      </CardFooter>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </Card>
  );
}
