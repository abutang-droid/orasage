import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, categoryLabels } from '@/lib/products';
import { getServerShopLocale } from '@/lib/currency-server';
import { fetchProductImageMap } from '@/lib/cms-product-images';
import { ProductDetailActions } from '@/components/ProductDetailActions';
import { ProductImage } from '@/components/ProductImage';
import { formatShopPrice, resolvePriceCents, currencyForLocale } from '@/lib/currency';

type PageProps = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku } = await params;
  const locale = await getServerShopLocale();
  const product = await getProduct(sku, locale);
  if (!product) return { title: '商品不存在' };
  return {
    title: `${product.name} · OraSage Energy Shop`,
    description: product.desc,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { sku } = await params;
  const locale = await getServerShopLocale();
  const [product, imageMap] = await Promise.all([
    getProduct(sku, locale),
    fetchProductImageMap(),
  ]);

  if (!product) notFound();

  const currency = currencyForLocale(locale);
  const displayCents = product.priceCentsResolved
    ?? resolvePriceCents(
      { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
      currency,
    );
  const displayPrice = product.priceDisplay ?? formatShopPrice(displayCents, currency);
  const imageUrl = imageMap.get(product.sku) ?? product.imageUrl ?? null;

  return (
    <main className="shop-page safe-bottom flex-1">
      <div className="shop-pdp">
        <div className="shop-pdp-media">
          <ProductImage
            sku={product.sku}
            name={product.name}
            category={product.category}
            imageUrl={imageUrl}
            className="shop-pdp-image"
            priority
          />
        </div>
        <div className="shop-pdp-info">
          <p className="shop-pdp-category">{categoryLabels[product.category]}</p>
          <h1 className="shop-pdp-title">{product.name}</h1>
          {product.element && (
            <p className="shop-pdp-element">五行 · {product.element}</p>
          )}
          <p className="shop-pdp-desc">{product.desc}</p>
          <p className="shop-pdp-price">{displayPrice}</p>
          <ProductDetailActions product={product} />
          <Link href="/" className="shop-pdp-back">
            ← 返回商城
          </Link>
        </div>
      </div>
    </main>
  );
}
