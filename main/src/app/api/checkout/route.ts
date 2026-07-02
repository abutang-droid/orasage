import { NextRequest, NextResponse } from 'next/server';
import { proxyShopCheckout, resolveAuthUserId } from '../../../../../shared/shop-checkout/server';

export async function POST(req: NextRequest) {
  const userId = await resolveAuthUserId(req.headers.get('cookie'));
  if (!userId) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  try {
    const body = await req.json() as {
      sku?: string;
      quantity?: number;
      recommendationContext?: string;
      readingId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };
    if (!body.sku?.trim()) {
      return NextResponse.json({ error: '缺少商品 SKU' }, { status: 400 });
    }
    const result = await proxyShopCheckout({
      userId,
      sku: body.sku,
      quantity: body.quantity,
      appSource: 'shop',
      recommendationContext: body.recommendationContext,
      readingId: body.readingId,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[main/checkout]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '结账失败' }, { status: 500 });
  }
}
