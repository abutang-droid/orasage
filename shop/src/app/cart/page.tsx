'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
import { useCart } from '@/lib/cart';
import { useShopLocale } from '@/components/ShopLocaleProvider';
import { formatShopPrice, resolvePriceCents } from '@/lib/currency';
import { ProductImage } from '@/components/ProductImage';

export default function CartPage() {
  const { cart, removeItem, setQuantity, clear } = useCart();
  const { currency } = useShopLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
    const cents = product.priceCentsResolved
      ?? resolvePriceCents(
        { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
        currency,
      );
    return sum + cents * line.quantity;
  }, 0);

  if (loading) {
    return <main className="shop-page p-16 text-center text-sage-muted">加载购物车…</main>;
  }

  if (cart.lines.length === 0) {
    return (
      <main className="shop-page safe-bottom flex-1 py-12 text-center">
        <h1 className="font-serif text-2xl text-sage-primary">购物车</h1>
        <p className="mt-4 text-sm text-sage-muted">购物车是空的</p>
        <Link href="/" className="shop-btn-primary mt-8 inline-flex px-8">
          去逛逛
        </Link>
      </main>
    );
  }

  return (
    <main className="shop-page safe-bottom flex-1 py-6">
      <div className="shop-cart-header">
        <h1 className="font-serif text-2xl text-sage-primary">购物车</h1>
        <button type="button" onClick={clear} className="shop-cart-clear">
          清空
        </button>
      </div>

      <ul className="shop-cart-list">
        {lines.map(({ line, product }) => {
          const displayCents = product
            ? (product.priceCentsResolved
              ?? resolvePriceCents(
                { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
                currency,
              ))
            : 0;
          const displayPrice = product?.priceDisplay ?? formatShopPrice(displayCents, currency);

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
                    数量
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
                    移除
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="shop-cart-footer">
        <p className="shop-cart-total">
          合计 <strong>{formatShopPrice(totalCents, currency)}</strong>
        </p>
        <p className="shop-cart-note">结账时一次处理一件商品；登录后填写配送与支付信息。</p>
        <Link
          href={`/checkout?sku=${encodeURIComponent(cart.lines[0].sku)}`}
          className="shop-btn-primary w-full text-center"
        >
          去结账
        </Link>
      </div>
    </main>
  );
}
