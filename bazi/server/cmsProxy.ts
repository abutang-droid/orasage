import type { Express } from 'express';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

async function proxyCmsJson(res: import('express').Response, path: string) {
  try {
    const upstream = await fetch(`${CMS_INTERNAL_URL}${path}`);
    if (!upstream.ok) {
      res.status(upstream.status).json(null);
      return;
    }
    const data = await upstream.json();
    res.set('Cache-Control', 'no-store');
    res.json(data);
  } catch {
    res.status(502).json(null);
  }
}

/** 同源代理 CMS 公开读接口，避免浏览器跨域请求被拦截 */
export function registerCmsProxy(app: Express) {
  app.get('/api/cms/bazi-home-hero', (_req, res) => {
    void proxyCmsJson(res, '/api/globals/bazi-home-hero?depth=1');
  });

  app.get('/api/cms/bazi-feed', (req, res) => {
    const query = req.url.includes('?') ? req.url.split('?')[1] : '';
    const path = query ? `/api/bazi-feed?${query}` : '/api/bazi-feed';
    void proxyCmsJson(res, path);
  });
}
