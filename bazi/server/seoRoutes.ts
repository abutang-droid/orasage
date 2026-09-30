import type { Express, Request, Response } from 'express';
import { ORASAGE_URLS } from '../client/src/lib/orasage-app-shell/config';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || ORASAGE_URLS.bazi;

export const BAZI_SITEMAP_ROUTES: Array<{
  path: string;
  priority: number;
  changefreq: string;
  noindex?: boolean;
}> = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/history', priority: 0.3, changefreq: 'monthly', noindex: true },
];

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildSitemapXml(): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = BAZI_SITEMAP_ROUTES.filter((r) => !r.noindex)
    .map((route) => {
      const loc = route.path === '/' ? BASE : `${BASE}${route.path}`;
      return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(2)}</priority>
  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function buildRobotsTxt(): string {
  // /reports/* 需允许爬虫读取 OG/Twitter 元数据，否则分享预览空白；
  // 报告本身不进 sitemap，避免被当作站点索引入口。
  return `User-agent: *
Allow: /
Allow: /reports/
Disallow: /history
Disallow: /api/

Sitemap: ${BASE}/sitemap.xml
`;
}

/** Register /sitemap.xml and /robots.txt before SPA static fallback. */
export function registerSeoRoutes(app: Express): void {
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.type('application/xml').send(buildSitemapXml());
  });
  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.type('text/plain').send(buildRobotsTxt());
  });
}
