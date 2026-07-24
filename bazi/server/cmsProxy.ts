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

async function proxyBaziHomeHero(res: import('express').Response) {
  try {
    const upstream = await fetch(
      `${CMS_INTERNAL_URL}/api/globals/bazi-home-hero?depth=1`,
    );
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

/** 信息流透传 CMS 列表 JSON，切勿套用 Hero resolve（否则 docs 丢失） */
async function proxyBaziFeed(res: import('express').Response, path: string) {
  try {
    const upstream = await fetch(`${CMS_INTERNAL_URL}${path}`, {
      cache: 'no-store',
    });
    if (!upstream.ok) {
      res.status(upstream.status).json({ docs: [] });
      return;
    }
    const data = await upstream.json();
    res.set('Cache-Control', 'no-store');
    res.json(data);
  } catch {
    res.status(502).json({ docs: [] });
  }
}

/** 同源代理 CMS 公开读接口，避免浏览器跨域请求被拦截 */
export function registerCmsProxy(app: Express) {
  app.get('/api/cms/bazi-home-hero', (_req, res) => {
    void proxyBaziHomeHero(res);
  });

  app.get('/api/cms/bazi-feed', (req, res) => {
    const query = req.url.includes('?') ? req.url.split('?')[1] : '';
    const path = query ? `/api/bazi-feed?${query}` : '/api/bazi-feed';
    void proxyBaziFeed(res, path);
  });
}
