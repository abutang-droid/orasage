import type { MetadataRoute } from 'next';
import { getSitemapContent } from '@/lib/content';

/** Generate at request time so CMS-backed article URLs are included when the CMS is reachable. */
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await getSitemapContent();
  return items.map((item) => ({
    url: item.canonical,
    lastModified: item.lastModified ? new Date(item.lastModified) : undefined,
    changeFrequency: item.changeFrequency ?? 'weekly',
    priority: item.priority ?? 0.5,
  }));
}
