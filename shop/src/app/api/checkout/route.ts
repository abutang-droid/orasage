import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getProduct } from '@/lib/products';
import { makeOrderNo, syncOrderToAuth } from '@/lib/orders';
import { ENV } from '@/lib/env';
import { getStripe } from '@/lib/stripe';
import { paymentsUseStripe } from '@/lib/payment-mode';
import { isLocalRequest } from '@/lib/internal';
import {
  currencyForLocale,
  detectShopLocale,
  resolvePriceCents,
  toStripeAmount,
  type ShopCurrency,
} from '@/lib/currency';
import { SHOP_LOCALE_COOKIE, SHOP_LOCALE_OVERRIDE_COOKIE } from '../../../../../shared/shop-locale/index';
import { resolveAuthUserId } from '../../../../../shared/shop-checkout/server';
import { inferRequiresShipping } from '../../../../../shared/shop-fulfillment/index';

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
  shippingMode: z.enum(['single', 'couple']).optional(),
  locale: z.string().max(16).optional(),
});

function localeFromRequest(req: NextRequest, explicit?: string | null): string {
  if (explicit) return detectShopLocale({ queryLocale: explicit });
  const cookie = req.cookies.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value
    ?? req.cookies.get(SHOP_LOCALE_COOKIE)?.value;
  return detectShopLocale({
    cookieLocale: cookie,
    acceptLanguage: req.headers.get('accept-language'),
  });
}

function unitPrice(product: NonNullable<Awaited<ReturnType<typeof getProduct>>>, currency: ShopCurrency): number {
  return resolvePriceCents(
    { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
    currency,
  );
}

function mockCheckoutUrl(orderNo: string, successUrl?: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ order: orderNo });
  if (successUrl) params.set('return', successUrl);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  return `${ENV.shopUrl}/checkout?${params.toString()}`;
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

    const locale = localeFromRequest(req, body.locale);
    const currency: ShopCurrency = currencyForLocale(locale);
    const lineItems: Array<{ product: NonNullable<Awaited<ReturnType<typeof getProduct>>>; quantity: number }> = [];

    for (const item of body.items) {
      const product = await getProduct(item.sku, locale);
      if (!product) {
        return NextResponse.json({ error: `商品不存在: ${item.sku}` }, { status: 400 });
      }
      lineItems.push({ product, quantity: item.quantity });
    }

    const amountCents = lineItems.reduce(
      (sum, li) => sum + unitPrice(li.product, currency) * li.quantity,
      0,
    );
    const title = lineItems.length === 1
      ? lineItems[0].product.name
      : `${lineItems[0].product.name} 等 ${lineItems.length} 件`;
    const orderNo = makeOrderNo();
    const primarySku = lineItems[0].product.sku;
    const needsShipping = lineItems.some((li) => li.product.requiresShipping ?? inferRequiresShipping(li.product));
    const checkoutExtras: Record<string, string> = {};
    if (needsShipping && body.shippingMode === 'couple') {
      checkoutExtras.shipping = 'couple';
    }

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

    if (paymentsUseStripe() && !needsShipping) {
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
            const charge = toStripeAmount(
              { priceCents: li.product.priceCents, priceCentsUsd: li.product.priceCentsUsd },
              currency,
            );
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
      checkoutUrl: mockCheckoutUrl(orderNo, body.successUrl, checkoutExtras),
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
    const { sku, quantity = 1 } = z.object({
      sku: z.string().min(1),
      quantity: z.number().int().positive().max(10).default(1),
    }).parse(await req.json());

    const locale = localeFromRequest(req);
    const currency: ShopCurrency = currencyForLocale(locale);
    const product = await getProduct(sku, locale);
    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const orderNo = makeOrderNo();
    const amountCents = unitPrice(product, currency) * quantity;
    const needsShipping = product.requiresShipping ?? inferRequiresShipping(product);
    const useStripe = paymentsUseStripe() && !needsShipping;

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
              const charge = toStripeAmount(
                { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
                currency,
              );
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
