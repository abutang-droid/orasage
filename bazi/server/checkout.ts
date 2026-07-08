import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import shopCheckout from '../../shared/shop-checkout/server';

const { proxyShopCheckout, resolveAuthUserId } = shopCheckout;

const bodySchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().positive().max(10).optional(),
  recommendationContext: z.string().max(2000).optional(),
  readingId: z.string().max(100).optional(),
  planType: z.enum(['basic', 'advanced', 'premium']).optional(),
  shippingMode: z.enum(['single', 'couple']).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export function registerCheckoutRoute(app: Express) {
  app.post('/api/checkout', async (req: Request, res: Response) => {
    const userId = await resolveAuthUserId(req.headers.cookie ?? null);
    if (!userId) {
      res.status(401).json({ error: '请先登录' });
      return;
    }
    try {
      const body = bodySchema.parse(req.body);
      const result = await proxyShopCheckout({
        userId,
        sku: body.sku,
        quantity: body.quantity,
        appSource: 'bazi',
        recommendationContext: body.recommendationContext,
        readingId: body.readingId,
        planType: body.planType,
        shippingMode: body.shippingMode,
        successUrl: body.successUrl,
        cancelUrl: body.cancelUrl,
        cookieHeader: req.headers.cookie ?? null,
      });
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: '参数错误' });
        return;
      }
      console.error('[bazi/checkout]', err);
      res.status(500).json({ error: err instanceof Error ? err.message : '结账失败' });
    }
  });
}
