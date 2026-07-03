import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getProduct } from '@/lib/products';
import { makeOrderNo, syncOrderToAuth } from '@/lib/orders';
import { ENV } from '@/lib/env';
import { getStripe } from '@/lib/stripe';
import { paymentsUseStripe } from '@/lib/payment-mode';
import { isLocalRequest } from '@/lib/internal';
import { detectCurrency, toStripeAmount, type ShopCurrency } from '@/lib/currency';
import { resolveAuthUserId } from '../../../../shared/shop-checkout/server';

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
  planType: z.string().max(32).optional(),
  currency: z.enum(['cny', 'usd']).optional(),
});

function mockCheckoutUrl(orderNo: string, successUrl?: string): string {
  let url = `${ENV.shopUrl}/checkout?order=${encodeURIComponent(orderNo)}`;
  if (successUrl) {
    url += `&return=${encodeURIComponent(successUrl)}`;
  }
  return url;
}

/** 内网结账 API — 供八字/紫微/塔罗等 App 调用 */
export async function POST(req: NextRequest) {
  if (!isLocalRequest(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const body = checkoutSchema.parse(await req.json());
    const verifiedUserId = await resolveAuthUserId(req.headers.get('cookie'));
    if (!verifiedUserId) {
      return NextResponse.json({ error: '未登录或凭证无效' }, { status: 401 });
    }
    if (body.userId !== verifiedUserId) {
      return NextResponse.json({ error: 'userId 与登录凭证不一致' }, { status: 403 });
    }

    const currency: ShopCurrency = body.currency ?? detectCurrency(req.headers.get('accept-language'));
    const lineItems: Array<{ product: NonNullable<Awaited<ReturnType<typeof getProduct>>>; quantity: number }> = [];

    for (const item of body.items) {
      const product = await getProduct(item.sku);
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
      sku: primarySku,
      amountCents,
      status: 'pending',
      appSource: body.appSource ?? 'shop',
      recommendationContext: body.recommendationContext,
      readingId: body.readingId,
    });

    const successUrl = body.successUrl
      ? `${body.successUrl}${body.successUrl.includes('?') ? '&' : '?'}order=${encodeURIComponent(orderNo)}`
      : `${ENV.shopUrl}/success?order=${orderNo}`;
    const cancelUrl = body.cancelUrl ?? `${ENV.shopUrl}/?cancelled=1`;

    if (paymentsUseStripe()) {
      const stripe = getStripe();
      if (stripe) {
        const stripeMeta: Record<string, string> = {
          orderNo,
          userId: String(body.userId),
          sku: primarySku,
          currency,
        };
        if (body.appSource) stripeMeta.appSource = body.appSource;
        if (body.readingId) stripeMeta.readingId = body.readingId;
        if (body.planType) stripeMeta.planType = body.planType;
        if (body.recommendationContext) {
          stripeMeta.recommendationContext = body.recommendationContext.slice(0, 500);
        }

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: stripeMeta,
          line_items: lineItems.map((li) => {
            const charge = toStripeAmount(li.product.priceCents, currency);
            return {
              quantity: li.quantity,
              price_data: {
                currency: charge.currency,
                unit_amount: charge.unit_amount,
                product_data: { name: li.product.name, description: li.product.desc },
              },
            };
          }),
        });
        return NextResponse.json({ orderNo, checkoutUrl: session.url, provider: 'stripe' });
      }
    }

    return NextResponse.json({
      orderNo,
      checkoutUrl: mockCheckoutUrl(orderNo, successUrl),
      provider: 'mock',
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

/** 商城前台购买 — 登录用户同步订单；mock 模式下未登录也可走模拟收银台 */
export async function PUT(req: NextRequest) {
  const user = await getAuthUser();

  try {
    const { sku, quantity = 1, currency: requestedCurrency } = z.object({
      sku: z.string().min(1),
      quantity: z.number().int().positive().max(10).default(1),
      currency: z.enum(['cny', 'usd']).optional(),
    }).parse(await req.json());

    const currency: ShopCurrency = requestedCurrency ?? detectCurrency(req.headers.get('accept-language'));
    const product = await getProduct(sku);
    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const orderNo = makeOrderNo();
    const amountCents = product.priceCents * quantity;
    const useStripe = paymentsUseStripe();

    if (user) {
      await syncOrderToAuth({
        userId: user.id,
        orderNo,
        title: quantity > 1 ? `${product.name} ×${quantity}` : product.name,
        sku: product.sku,
        amountCents,
        status: 'pending',
        appSource: 'shop',
      });
    } else if (useStripe) {
      // Stripe guest checkout — order sync happens in webhook when configured
    } else {
      return NextResponse.json({
        error: '请先登录',
        loginUrl: `${ENV.authUrl}/login?redirect=${encodeURIComponent(`${ENV.shopUrl}/?sku=${sku}`)}`,
      }, { status: 401 });
    }

    if (useStripe) {
      const stripe = getStripe();
      if (stripe) {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          success_url: `${ENV.shopUrl}/success?order=${orderNo}`,
          cancel_url: `${ENV.shopUrl}/?sku=${sku}`,
          metadata: {
            orderNo,
            userId: user ? String(user.id) : 'guest',
            sku: product.sku,
            currency,
          },
          line_items: [{
            quantity,
            price_data: (() => {
              const charge = toStripeAmount(product.priceCents, currency);
              return {
                currency: charge.currency,
                unit_amount: charge.unit_amount,
                product_data: { name: product.name, description: product.desc },
              };
            })(),
          }],
        });
        return NextResponse.json({ orderNo, checkoutUrl: session.url, provider: 'stripe' });
      }
    }

    return NextResponse.json({
      orderNo,
      provider: 'mock',
      amountCents,
      title: product.name,
      checkoutUrl: mockCheckoutUrl(orderNo),
      mockPayUrl: `/api/pay?order=${orderNo}`,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[checkout PUT]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '结账失败' }, { status: 500 });
  }
}
