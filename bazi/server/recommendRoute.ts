import type { Express } from 'express';
import { z } from 'zod';
import { fetchReportProductRecommend } from './reportRecommend.ts';

const querySchema = z.object({
  birthStr: z.string().min(1).max(80),
  gender: z.string().min(1).max(10),
  name: z.string().max(50).optional(),
  wuXing: z.string().min(2).max(200),
  locale: z.string().max(20).optional(),
});

export function registerRecommendRoute(app: Express) {
  app.get('/api/recommend/product', async (req, res) => {
    try {
      const parsed = querySchema.parse(req.query);
      let wuXing: Record<string, number>;
      try {
        wuXing = JSON.parse(parsed.wuXing) as Record<string, number>;
      } catch {
        res.status(400).json({ error: 'wuXing 格式错误' });
        return;
      }
      const product = await fetchReportProductRecommend(wuXing, {
        locale: parsed.locale ?? 'zh-CN',
        chart: {
          birthStr: parsed.birthStr,
          gender: parsed.gender,
          name: parsed.name,
        },
      });
      if (!product?.sku) {
        res.status(404).json({ error: '暂无推荐商品' });
        return;
      }
      res.json({ product });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: '参数错误' });
        return;
      }
      console.error('[bazi/recommend]', err);
      res.status(500).json({ error: '服务器内部错误' });
    }
  });
}
