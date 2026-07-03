import type { MetadataRoute } from 'next';
import { ORASAGE_URLS } from '@/lib/orasage-seo';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || ORASAGE_URLS.ziwei;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/preview-versions/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
