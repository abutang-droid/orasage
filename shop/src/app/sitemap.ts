import type { MetadataRoute } from 'next';
import { ORASAGE_URLS } from '@/lib/orasage-seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: ORASAGE_URLS.shop,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
