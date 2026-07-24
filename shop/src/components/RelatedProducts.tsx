import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Product } from '@/lib/products';
import { ProductImage } from '@/components/ProductImage';
import { formatDualShopPrice } from '@/lib/currency';

export async function RelatedProducts({ skus, title }: { skus: string[]; title?: string }) {
  if (!skus.length) return null;

  const { fetchProducts } = await import('@/lib/products');
  const { fetchProductImageMap } = await import('@/lib/cms-product-images');
  const { getServerShopLocale } = await import('@/lib/currency-server');

  const locale = await getServerShopLocale();
  const t = await getTranslations('pdp');
  const [products, imageMap] = await Promise.all([fetchProducts(locale), fetchProductImageMap()]);
  const related = skus
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  if (!related.length) return null;

  return (
    <div className="shop-pdp-related">
      <h3 className="shop-pdp-related-heading">{title?.trim() || t('ui.related')}</h3>
      <div className="shop-pdp-related-grid">
        {related.map((product) => (
          <RelatedProductCard
            key={product.sku}
            product={product}
            imageUrl={imageMap.get(product.sku) ?? product.imageUrl ?? null}
          />
        ))}
      </div>
    </div>
  );
}

function RelatedProductCard({
  product,
  imageUrl,
}: {
  product: Product;
  imageUrl: string | null;
}) {
  const displayPrice = formatDualShopPrice({
    priceCents: product.priceCents,
    priceCentsUsd: product.priceCentsUsd,
  });

  return (
    <Link href={`/product/${encodeURIComponent(product.sku)}`} className="shop-pdp-related-card">
      <ProductImage
        sku={product.sku}
        name={product.name}
        category={product.category}
        imageUrl={imageUrl}
        className="shop-pdp-related-image"
      />
      <span className="shop-pdp-related-name">{product.name}</span>
      <span className="shop-pdp-related-price">{displayPrice}</span>
    </Link>
  );
}
