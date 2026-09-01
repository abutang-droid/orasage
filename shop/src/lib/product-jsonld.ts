import type { Product } from '@/lib/products';

export function buildProductJsonLd(opts: {
  product: Product;
  locale: string;
  description: string;
  imageUrl?: string;
  priceCents: number;
  currency: string;
}): Record<string, unknown> {
  const { product, description, imageUrl, priceCents, currency } = opts;
  const price = (priceCents / 100).toFixed(2);
  const url = `https://shop.orasage.com/product/${encodeURIComponent(product.sku)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description,
    brand: { '@type': 'Brand', name: 'OraSage' },
    ...(imageUrl ? { image: imageUrl } : {}),
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
      url,
    },
  };
}
