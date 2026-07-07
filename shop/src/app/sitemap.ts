import type { MetadataRoute } from 'next';
import { ORASAGE_URLS } from '@/lib/orasage-seo';
import { fetchProducts } from '@/lib/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProducts('zh-CN');
  const productEntries = products.map((product) => ({
    url: `${ORASAGE_URLS.shop}/product/${encodeURIComponent(product.sku)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: ORASAGE_URLS.shop,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...productEntries,
  ];
}
