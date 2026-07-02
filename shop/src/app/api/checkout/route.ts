import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getProduct } from '@/lib/products';
import { makeOrderNo, syncOrderToAuth } from '@/lib/orders';
import { ENV, hasStripe } from '@/lib/env';
import { getStripe } from '@/lib/stripe';
import { isLocalRequest } from '@/lib/internal';

const checkoutSchema = z.object({
  userId: z.number().int().positive(),
  items: z.array(z.object({
    sku: z.string().min(1),
    quantity: z.number().int().positive().max(10).default(1),
  })).min(1),
  appSource: z.enum(['bazi', 'ziwei', 'tarot', 'shop']).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  recommendationContext: z.string().max(2000).optional(),
  readingId: z.string().max(100).optional(),
});

/** 内网结账 API — 供八字/紫微/塔罗等 App 调用 */
export async function POST(req: NextRequest) {
  if (!isLocalRequest(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const body = checkoutSchema.parse(await req.json());
    const lineItems: Array<{ product: NonNullable<ReturnType<typeof getProduct>>; quantity: number }> = [];

    for (const item of body.items) {
      const product = getProduct(item.sku);
      if (!product) {
        return NextResponse.json({ error: `商品不存在: ${item.sku}` }, { status: 400 });
      }
      lineItems.push({ product, quantity: item.quantity });
    }

    const amountCents = lineItems.reduce((sum, li) => sum + li.product.priceCents * li.quantity, 0);
    const title = lineItems.length === 1
      ? lineItems[0].product.name
      : `${lineItems[0].product.name} 等 ${lineItems.length} 件`;
    const orderNo = makeOrderNo();
    const primarySku = lineItems[0].product.sku;

    await syncOrderToAuth({
      userId: body.userId,
      orderNo,
      title,
      amountCents,
      status: 'pending',
      appSource: body.appSource ?? 'shop',
      sku: primarySku,
      recommendationContext: body.recommendationContext,
      readingId: body.readingId,
    });

    const successUrl = body.successUrl ?? `${ENV.shopUrl}/success?order=${orderNo}`;
    const cancelUrl = body.cancelUrl ?? `${ENV.shopUrl}/?cancelled=1`;
    const stripeMeta: Record<string, string> = {
      orderNo,
      userId: String(body.userId),
      sku: primarySku,
    };
    if (body.appSource) stripeMeta.appSource = body.appSource;
    if (body.readingId) stripeMeta.readingId = body.readingId;
    if (body.recommendationContext) {
      stripeMeta.recommendationContext = body.recommendationContext.slice(0, 500);
    }

    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: stripeMeta,
        line_items: lineItems.map((li) => ({
          quantity: li.quantity,
          price_data: {
            currency: 'cny',
            unit_amount: li.product.priceCents,
            product_data: { name: li.product.name, description: li.product.desc },
          },
        })),
      });
      return NextResponse.json({ orderNo, checkoutUrl: session.url, provider: 'stripe' });
    }

    return NextResponse.json({
      orderNo,
      checkoutUrl: `${ENV.shopUrl}/checkout?order=${orderNo}`,
      provider: 'demo',
      amountCents,
      title,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误', details: err.errors }, { status: 400 });
    }
    console.error('[checkout]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '结账失败' }, { status: 500 });
  }
}

/** 商城前台购买 — 需登录 */
export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: '请先登录', loginUrl: `${ENV.authUrl}/login?redirect=${encodeURIComponent(ENV.shopUrl)}` }, { status: 401 });
  }

  try {
    const { sku, quantity = 1 } = z.object({
      sku: z.string().min(1),
      quantity: z.number().int().positive().max(10).default(1),
    }).parse(await req.json());

    const product = getProduct(sku);
    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const orderNo = makeOrderNo();
    const amountCents = product.priceCents * quantity;

    await syncOrderToAuth({
      userId: user.id,
      orderNo,
      title: quantity > 1 ? `${product.name} ×${quantity}` : product.name,
      amountCents,
      status: 'pending',
      appSource: 'shop',
      sku: product.sku,
    });

    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: `${ENV.shopUrl}/success?order=${orderNo}`,
        cancel_url: `${ENV.shopUrl}/?sku=${sku}`,
        metadata: { orderNo, userId: String(user.id) },
        line_items: [{
          quantity,
          price_data: {
            currency: 'cny',
            unit_amount: product.priceCents,
            product_data: { name: product.name, description: product.desc },
          },
        }],
      });
      return NextResponse.json({ orderNo, checkoutUrl: session.url, provider: 'stripe' });
    }

    return NextResponse.json({
      orderNo,
      provider: 'demo',
      amountCents,
      title: product.name,
      demoPayUrl: `/api/pay?order=${orderNo}`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[checkout PUT]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '结账失败' }, { status: 500 });
  }
}
