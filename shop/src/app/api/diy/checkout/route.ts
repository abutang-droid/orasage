import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { ENV } from '@/lib/env';
import { createCheckoutOrder, mockCheckoutUrl } from '@/lib/checkout-flow';
import { DIY_ORDER_SKU } from '@/lib/diy';
import { encodeDiyOrderContext } from '../../../../../../shared/shop-diy/order-context';

const diyCheckoutSchema = z.object({
  beads: z.array(z.string().min(1).max(100)).min(1).max(120),
  wristCm: z.number().min(10).max(25),
});

type QuoteResponse = {
  ok?: boolean;
  error?: string;
  totalCents: number;
  totalCentsUsd: number;
  lengthMm: number;
  effectiveLengthMm: number;
  targetMm: number;
  items: Array<{
    code: string;
    name: string;
    sizeLabel: string;
    type: string;
    priceCents: number;
    quantity: number;
  }>;
};

/** 共振定制下单：服务端验价 → 固化设计稿 → 创建订单（走现有支付/发货流程） */
export async function PUT(req: NextRequest) {
  const user = await getAuthUser();

  try {
    const body = diyCheckoutSchema.parse(await req.json());

    if (!user) {
      return NextResponse.json({
        error: '请先登录',
        loginUrl: `${process.env.AUTH_URL ?? 'https://auth.orasage.com'}/login?redirect=${encodeURIComponent(`${process.env.SHOP_URL ?? 'https://shop.orasage.com'}/diy`)}`,
      }, { status: 401 });
    }

    const quoteRes = await fetch(`${ENV.authInternalUrl}/internal/diy/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beads: body.beads, wristCm: body.wristCm }),
    });
    const quote = await quoteRes.json() as QuoteResponse;
    if (!quoteRes.ok) {
      return NextResponse.json({ error: quote.error || '验价失败' }, { status: 400 });
    }

    let designId: number | undefined;
    try {
      const designRes = await fetch(`${ENV.authInternalUrl}/internal/diy/designs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          beads: body.beads,
          wristCm: body.wristCm,
          totalCents: quote.totalCents,
          status: 'ordered',
        }),
      });
      const designData = await designRes.json() as { id?: number };
      if (designRes.ok && designData.id) designId = designData.id;
    } catch (err) {
      console.warn('[diy checkout] save design failed:', err);
    }

    const context = encodeDiyOrderContext({
      designId,
      wristCm: body.wristCm,
      lengthMm: quote.effectiveLengthMm,
      sequence: body.beads,
      items: quote.items,
    });

    const result = await createCheckoutOrder(req, {
      userId: user.id,
      sku: DIY_ORDER_SKU,
      quantity: 1,
      appSource: 'shop',
      priceCents: quote.totalCents,
      priceCentsUsd: quote.totalCentsUsd,
      recommendationContext: context,
    });

    if (designId) {
      fetch(`${ENV.authInternalUrl}/internal/diy/designs/${designId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo: result.orderNo }),
      }).catch(() => {});
    }

    return NextResponse.json({
      orderNo: result.orderNo,
      provider: result.provider,
      amountCents: result.amountCents,
      title: result.title,
      checkoutUrl: result.checkoutUrl ?? mockCheckoutUrl(result.orderNo),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[diy checkout]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '下单失败' }, { status: 500 });
  }
}
