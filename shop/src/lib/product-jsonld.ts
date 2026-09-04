import type { Product } from '@/lib/products';
import {
  faqJsonLd,
  productAggregateRatingJsonLd,
} from '../../../shared/seo/jsonld';

export { faqJsonLd };

export function buildProductJsonLd(opts: {
  product: Product;
  locale: string;
  description: string;
  imageUrl?: string;
  priceCents: number;
  currency: string;
  ratingValue?: number;
  reviewCount?: number;
  faqItems?: Array<{ question: string; answer: string }>;
}): Record<string, unknown> {
  const { product, description, imageUrl, priceCents, currency } = opts;
  const price = (priceCents / 100).toFixed(2);
  const url = `https://shop.orasage.com/product/${encodeURIComponent(product.sku)}`;
  const aggregateRating = productAggregateRatingJsonLd({
    ratingValue: opts.ratingValue ?? 0,
    reviewCount: opts.reviewCount ?? 0,
  });
  const faq = opts.faqItems?.length ? faqJsonLd(opts.faqItems) : null;

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
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(faq ? { subjectOf: faq } : {}),
  };
}
