import type { Express } from 'express';
import {
  fallbackBaziHomeHero,
  resolveBaziHeroFromRaw,
} from './cmsBaziHero';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

const SERVER_FALLBACK = fallbackBaziHomeHero({
  eyebrow: '八字命理',
  title: '八字排盘',
  subtitle: '输入生辰，探索命盘奥秘',
});

async function proxyCmsJson(res: import('express').Response, path: string) {
  try {
    const upstream = await fetch(`${CMS_INTERNAL_URL}${path}`);
    if (!upstream.ok) {
      res.status(upstream.status).json(SERVER_FALLBACK);
      return;
    }
    const data = await upstream.json();
    res.set('Cache-Control', 'no-store');
    res.json(await resolveBaziHeroFromRaw(data, SERVER_FALLBACK));
  } catch {
    res.status(502).json(SERVER_FALLBACK);
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
