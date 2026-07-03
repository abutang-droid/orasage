import type { MetadataRoute } from 'next';
import { ORASAGE_URLS } from '@/lib/orasage-seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${ORASAGE_URLS.shop}/sitemap.xml`,
  };
}
