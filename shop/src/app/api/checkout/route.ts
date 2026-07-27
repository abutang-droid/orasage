import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { getProduct } from '@/lib/products';
import { isLocalRequest } from '@/lib/internal';
import { resolveAuthUserId } from '../../../../../shared/shop-checkout/server';
import {
  createCheckoutOrder,
  localeFromCheckoutRequest,
  mockCheckoutUrl,
  startCheckoutBodySchema,
  validateCheckoutQuantity,
} from '@/lib/checkout-flow';
import {
  currencyForLocale,
  resolvePriceCents,
  type ShopCurrency,
} from '@/lib/currency';
import { ENV } from '@/lib/env';

const checkoutSchema = startCheckoutBodySchema.extend({
  userId: z.number().int().positive(),
  sku: z.string().min(1).optional(),
  items: z.array(z.object({
    sku: z.string().min(1),
    quantity: z.number().int().positive().max(100).default(1),
  })).min(1).optional(),
}).refine((b) => Boolean(b.sku || (b.items && b.items.length > 0)), {
  message: '需要 sku 或 items',
}).superRefine((body, ctx) => {
  const sku = body.items?.[0]?.sku ?? body.sku;
  const quantity = body.items?.[0]?.quantity ?? body.quantity ?? 1;
  if (!sku) return;
  validateCheckoutQuantity(sku, quantity, ctx);
});

function unitPrice(product: NonNullable<Awaited<ReturnType<typeof getProduct>>>, currency: ShopCurrency): number {
  return resolvePriceCents(
    { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
    currency,
  );
}

/** 内网结账 API — 供八字/紫微/塔罗等 App 服务端代理调用 */
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

    const sku = body.items?.[0]?.sku ?? body.sku;
    if (!sku) {
      return NextResponse.json({ error: '需要 sku 或 items' }, { status: 400 });
    }
    const quantity = body.items?.[0]?.quantity ?? body.quantity ?? 1;
    const result = await createCheckoutOrder(req, {
      userId: body.userId,
      sku,
      quantity,
      appSource: body.appSource,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      recommendationContext: body.recommendationContext,
      readingId: body.readingId,
      crystalSku: body.crystalSku,
      planType: body.planType,
      shippingMode: body.shippingMode,
      locale: body.locale,
      priceCentsUsd: body.priceCentsUsd,
      priceCents: body.priceCents,
    });
    return NextResponse.json(result);
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

    const locale = localeFromCheckoutRequest(req);
    const currency: ShopCurrency = currencyForLocale(locale);
    const product = await getProduct(sku, locale);
    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const amountCents = unitPrice(product, currency) * quantity;

    if (user) {
      const result = await createCheckoutOrder(req, {
        userId: user.id,
        sku,
        quantity,
        appSource: 'shop',
      });
      return NextResponse.json({
        orderNo: result.orderNo,
        provider: result.provider,
        amountCents: result.amountCents,
        title: result.title,
        checkoutUrl: result.checkoutUrl ?? mockCheckoutUrl(result.orderNo),
        mockPayUrl: `/api/pay?order=${result.orderNo}`,
      });
    }

    return NextResponse.json({
      error: '请先登录',
      loginUrl: `${ENV.authUrl}/login?redirect=${encodeURIComponent(`${ENV.shopUrl}/?sku=${sku}`)}`,
    }, { status: 401 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[checkout PUT]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '结账失败' }, { status: 500 });
  }
}
