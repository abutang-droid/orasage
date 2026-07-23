'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@orasage/ui/button';
import type { Product } from '@/lib/products';
import { useCart } from '@/lib/cart';
import { formatDualShopPrice, resolveUsdtCents } from '@/lib/currency';
import { ProductImage } from '@/components/ProductImage';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? ORASAGE_URLS.shop;
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? ORASAGE_URLS.auth;

export default function CartPage() {
  const t = useTranslations('cart');
  const router = useRouter();
  const { cart, removeItem, setQuantity, clear } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/products', { credentials: 'include' });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setProducts(data.products ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const bySku = useMemo(() => new Map(products.map((p) => [p.sku, p])), [products]);

  const lines = cart.lines.map((line) => ({
    line,
    product: bySku.get(line.sku),
  }));

  const totalCents = lines.reduce((sum, { line, product }) => {
    if (!product) return sum;
    const cents = resolveUsdtCents({
      priceCents: product.priceCents,
      priceCentsUsd: product.priceCentsUsd,
    });
    return sum + cents * line.quantity;
  }, 0);

  async function handleCheckout() {
    if (cart.lines.length === 0) return;
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/checkout/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.lines.map((line) => ({ sku: line.sku, quantity: line.quantity })),
          appSource: 'shop',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        const returnUrl = `${SHOP_URL}/cart`;
        window.location.href = `${AUTH_URL}/login?redirect=${encodeURIComponent(returnUrl)}`;
        return;
      }
      if (!res.ok) throw new Error(data.error || t('checkoutFailed'));
      router.push(`/checkout?order=${encodeURIComponent(data.orderNo)}`);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : t('checkoutFailed'));
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) {
    return <main className="shop-page p-16 text-center text-sage-muted">{t('loading')}</main>;
  }

  if (cart.lines.length === 0) {
    return (
      <main className="shop-page safe-bottom flex-1 py-12 text-center">
        <h1 className="font-serif text-2xl text-sage-primary">{t('title')}</h1>
        <p className="mt-4 text-sm text-sage-muted">{t('empty')}</p>
        <Button asChild className="mt-8 px-8">
          <Link href="/">{t('browse')}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="shop-page safe-bottom flex-1 py-6">
      <div className="shop-cart-header">
        <h1 className="font-serif text-2xl text-sage-primary">{t('title')}</h1>
        <button type="button" onClick={clear} className="shop-cart-clear">
          {t('clear')}
        </button>
      </div>

      <ul className="shop-cart-list">
        {lines.map(({ line, product }) => {
          const displayPrice = product
            ? formatDualShopPrice({
              priceCents: product.priceCents,
              priceCentsUsd: product.priceCentsUsd,
            })
            : '—';

          return (
            <li key={line.sku} className="shop-cart-item">
              <Link href={`/product/${encodeURIComponent(line.sku)}`} className="shop-cart-item-media">
                {product ? (
                  <ProductImage
                    sku={product.sku}
                    name={product.name}
                    category={product.category}
                    imageUrl={product.imageUrl}
                    className="shop-cart-item-image"
                  />
                ) : (
                  <div className="shop-cart-item-image shop-cart-item-image--placeholder" />
                )}
              </Link>
              <div className="shop-cart-item-body">
                <Link href={`/product/${encodeURIComponent(line.sku)}`} className="shop-cart-item-name">
                  {product?.name ?? line.sku}
                </Link>
                <p className="shop-cart-item-price">{displayPrice}</p>
                <div className="shop-cart-item-controls">
                  <label className="shop-cart-qty">
                    {t('quantity')}
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={line.quantity}
                      onChange={(e) => setQuantity(line.sku, Number(e.target.value))}
                      className="shop-cart-qty-input"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem(line.sku)}
                    className="shop-cart-remove"
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="shop-cart-footer">
        <p className="shop-cart-total">
          {t('total')} <strong>{formatDualShopPrice(totalCents)}</strong>
        </p>
        <p className="shop-cart-note">{t('note')}</p>
        {checkoutError ? <p className="mt-2 text-sm text-red-600">{checkoutError}</p> : null}
        <Button
          type="button"
          onClick={() => void handleCheckout()}
          disabled={checkingOut}
          loading={checkingOut}
          className="w-full"
        >
          {checkingOut ? t('checkoutLoading') : t('checkout')}
        </Button>
      </div>
    </main>
  );
}
