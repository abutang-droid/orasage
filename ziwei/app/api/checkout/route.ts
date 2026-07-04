import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { proxyShopCheckout, resolveAuthUserId } from '../../../../shared/shop-checkout/server';

const bodySchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().positive().max(10).optional(),
  recommendationContext: z.string().max(2000).optional(),
  readingId: z.string().max(100).optional(),
  shippingMode: z.enum(['single', 'couple']).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const userId = await resolveAuthUserId(req.headers.get('cookie'));
  if (!userId) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  try {
    const body = bodySchema.parse(await req.json());
    const result = await proxyShopCheckout({
      userId,
      sku: body.sku,
      quantity: body.quantity,
      appSource: 'ziwei',
      recommendationContext: body.recommendationContext,
      readingId: body.readingId,
      shippingMode: body.shippingMode,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      cookieHeader: req.headers.get('cookie'),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[ziwei/checkout]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '结账失败' }, { status: 500 });
  }
}
