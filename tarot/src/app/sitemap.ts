import type { MetadataRoute } from 'next';
import { ORASAGE_URLS } from '@/lib/orasage-seo';
import { TAROT_SITEMAP_ROUTES } from '@/lib/seo-routes';

export default function sitemap(): MetadataRoute.Sitemap {
  return TAROT_SITEMAP_ROUTES.filter((route) => !route.noindex).map((route) => ({
    url: route.path === '/' ? ORASAGE_URLS.tarot : `${ORASAGE_URLS.tarot}${route.path}`,
    changeFrequency: 'weekly' as const,
    priority: route.priority ?? 0.5,
  }));
}
