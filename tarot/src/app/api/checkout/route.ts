import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { TEMPLE_DONATION } from '@/lib/merit';
import { proxyShopCheckout, resolveAuthUserId } from '../../../../../shared/shop-checkout/server';

const bodySchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().positive().max(10).optional(),
  recommendationContext: z.string().max(2000).optional(),
  readingId: z.string().max(100).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  priceCentsUsd: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const userId = await resolveAuthUserId(req.headers.get('cookie'));
  if (!userId) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  try {
    const body = bodySchema.parse(await req.json());
    if (body.sku === TEMPLE_DONATION.sku) {
      if (
        body.priceCentsUsd == null ||
        body.priceCentsUsd < TEMPLE_DONATION.minCentsUsd ||
        body.priceCentsUsd > TEMPLE_DONATION.maxCentsUsd
      ) {
        return NextResponse.json({ error: '乐捐金额需在 $0.01–$1 之间' }, { status: 400 });
      }
    }

    const tarotUser = await getAuthUser();
    const tarotTag = tarotUser ? `tarotUser:${tarotUser.userId}` : '';
    const recommendationContext = [body.recommendationContext, tarotTag].filter(Boolean).join('|');

    const result = await proxyShopCheckout({
      userId,
      sku: body.sku,
      quantity: body.quantity,
      appSource: 'tarot',
      recommendationContext: recommendationContext || undefined,
      readingId: body.readingId,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      priceCentsUsd: body.priceCentsUsd,
      cookieHeader: req.headers.get('cookie'),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[tarot/checkout]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '结账失败' }, { status: 500 });
  }
}
