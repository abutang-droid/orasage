import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProduct } from '@/lib/products';
import { makeOrderNo, syncOrderToAuth } from '@/lib/orders';
import { ENV } from '@/lib/env';
import { getStripe } from '@/lib/stripe';
import { paymentsUseStripe } from '@/lib/payment-mode';
import {
  currencyForLocale,
  detectShopLocale,
  resolvePriceCents,
  toStripeAmount,
  type ShopCurrency,
} from '@/lib/currency';
import { SHOP_LOCALE_COOKIE, SHOP_LOCALE_OVERRIDE_COOKIE } from '../../../shared/shop-locale/index';
import { inferRequiresShipping } from '../../../shared/shop-fulfillment/index';
import {
  encodeCartOrderContext,
  SHOP_CART_ORDER_SKU,
  type CartOrderLine,
} from '../../../shared/shop-cart/cart-order';
import {
  isValidTempleDonationQuantity,
  TEMPLE_DONATION,
} from '../../../shared/tarot-merit/donation';

export const cartCheckoutLineSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().positive().max(10).default(1),
});

export const cartStartCheckoutSchema = z.object({
  items: z.array(cartCheckoutLineSchema).min(1).max(20),
  appSource: z.enum(['shop']).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  locale: z.string().max(16).optional(),
});

export const startCheckoutBodySchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int().positive().max(100).default(1),
  appSource: z.enum(['bazi', 'ziwei', 'tarot', 'shop']).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  recommendationContext: z.string().max(2000).optional(),
  readingId: z.string().max(100).optional(),
  /** 八字组合「五行推荐水晶」变量：实际履约水晶 SKU */
  crystalSku: z.string().max(100).optional(),
  planType: z.string().max(32).optional(),
  shippingMode: z.enum(['single', 'couple']).optional(),
  priceCents: z.number().int().positive().optional(),
  priceCentsUsd: z.number().int().positive().optional(),
  locale: z.string().max(16).optional(),
});

export function validateCheckoutQuantity(sku: string, quantity: number, ctx: z.RefinementCtx): void {
  if (sku === TEMPLE_DONATION.sku) {
    if (!isValidTempleDonationQuantity(quantity)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '乐捐金额需在 $0.01–$1 之间',
        path: ['quantity'],
      });
    }
    return;
  }
  if (quantity > 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '数量超出限制',
      path: ['quantity'],
    });
  }
}

export const startCheckoutSchema = startCheckoutBodySchema.superRefine((body, ctx) => {
  validateCheckoutQuantity(body.sku, body.quantity ?? 1, ctx);
});

export type CartStartCheckoutInput = z.infer<typeof cartStartCheckoutSchema> & { userId: number };

export type StartCheckoutInput = z.infer<typeof startCheckoutSchema> & { userId: number };

export type StartCheckoutResult = {
  orderNo: string;
  checkoutUrl?: string | null;
  provider: string;
  amountCents: number;
  title: string;
  needsShipping: boolean;
  shippingMode?: 'single' | 'couple';
};

export function localeFromCheckoutRequest(req: NextRequest, explicit?: string | null): string {
  if (explicit) return detectShopLocale({ queryLocale: explicit });
  const cookie = req.cookies.get(SHOP_LOCALE_COOKIE)?.value
    ?? req.cookies.get(SHOP_LOCALE_OVERRIDE_COOKIE)?.value;
  return detectShopLocale({
    cookieLocale: cookie,
    acceptLanguage: req.headers.get('accept-language'),
  });
}

function unitPrice(
  product: NonNullable<Awaited<ReturnType<typeof getProduct>>>,
  currency: ShopCurrency,
  override?: { priceCents?: number; priceCentsUsd?: number | null },
): number {
  if (override?.priceCents != null) {
    return resolvePriceCents(
      { priceCents: override.priceCents, priceCentsUsd: override.priceCentsUsd ?? product.priceCentsUsd },
      currency,
    );
  }
  return resolvePriceCents(
    { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
    currency,
  );
}

export function mockCheckoutUrl(orderNo: string, successUrl?: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ order: orderNo });
  if (successUrl) params.set('return', successUrl);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  return `${ENV.shopUrl}/checkout?${params.toString()}`;
}

/** 为已登录用户创建待支付订单 */
export async function createCheckoutOrder(
  req: NextRequest,
  input: StartCheckoutInput,
): Promise<StartCheckoutResult> {
  const locale = localeFromCheckoutRequest(req, input.locale);
  const currency: ShopCurrency = currencyForLocale(locale);
  const product = await getProduct(input.sku, locale);
  if (!product) {
    throw new Error(`商品不存在: ${input.sku}`);
  }

  const quantity = input.quantity ?? 1;
  const amountCents = unitPrice(product, currency, {
    priceCents: input.priceCents,
    priceCentsUsd: input.priceCentsUsd,
  }) * quantity;
  const orderNo = makeOrderNo();
  const needsShipping = product.requiresShipping ?? inferRequiresShipping(product);
  const checkoutExtras: Record<string, string> = {};
  if (input.appSource) checkoutExtras.appSource = input.appSource;
  if (input.planType) checkoutExtras.planType = input.planType;
  if (input.readingId) checkoutExtras.readingId = input.readingId;
  if (needsShipping && input.shippingMode === 'couple') {
    checkoutExtras.shipping = 'couple';
  }

  const { resolveComboCrystalFulfillment } = await import('./combo-crystal');
  const crystalFulfillment = await resolveComboCrystalFulfillment({
    comboSku: product.sku,
    locale,
    productName: product.name,
    readingId: input.readingId,
    crystalSku: input.crystalSku,
    recommendationContext: input.recommendationContext,
  });
  const orderTitleBase = crystalFulfillment?.title ?? product.name;
  const orderTitle = quantity > 1 ? `${orderTitleBase} ×${quantity}` : orderTitleBase;
  const recommendationContext = crystalFulfillment?.context ?? input.recommendationContext;
  if (crystalFulfillment?.crystalSku) {
    checkoutExtras.crystalSku = crystalFulfillment.crystalSku;
  }

  await syncOrderToAuth({
    userId: input.userId,
    orderNo,
    title: orderTitle,
    sku: product.sku,
    amountCents,
    currency: 'USDT',
    status: 'pending',
    appSource: input.appSource ?? 'shop',
    recommendationContext,
    readingId: input.readingId,
  });

  const successUrl = input.successUrl
    ? `${input.successUrl}${input.successUrl.includes('?') ? '&' : '?'}order=${encodeURIComponent(orderNo)}`
    : `${ENV.shopUrl}/success?order=${orderNo}`;
  const cancelUrl = input.cancelUrl ?? `${ENV.shopUrl}/?cancelled=1`;

  if (paymentsUseStripe() && !needsShipping) {
    const stripe = getStripe();
    if (stripe) {
      const stripeMeta: Record<string, string> = {
        orderNo,
        userId: String(input.userId),
        sku: product.sku,
        currency,
      };
      if (input.appSource) stripeMeta.appSource = input.appSource;
      if (input.readingId) stripeMeta.readingId = input.readingId;
      if (input.planType) stripeMeta.planType = input.planType;
      if (recommendationContext) {
        stripeMeta.recommendationContext = recommendationContext.slice(0, 500);
      }
      if (crystalFulfillment?.crystalSku) {
        stripeMeta.crystalSku = crystalFulfillment.crystalSku;
      }

      const charge = toStripeAmount(
        {
          priceCents: input.priceCents ?? product.priceCents,
          priceCentsUsd: input.priceCentsUsd ?? product.priceCentsUsd,
        },
        currency,
      );
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: stripeMeta,
        line_items: [{
          quantity,
          price_data: {
            currency: charge.currency,
            unit_amount: charge.unit_amount,
            product_data: { name: product.name, description: product.desc },
          },
        }],
      });
      return {
        orderNo,
        checkoutUrl: session.url,
        provider: 'stripe',
        amountCents,
        title: orderTitleBase,
        needsShipping,
        shippingMode: input.shippingMode,
      };
    }
  }

  return {
    orderNo,
    checkoutUrl: mockCheckoutUrl(orderNo, input.successUrl, checkoutExtras),
    provider: 'mock',
    amountCents,
    title: orderTitleBase,
    needsShipping,
    shippingMode: input.shippingMode,
  };
}

type ResolvedCartLine = {
  product: NonNullable<Awaited<ReturnType<typeof getProduct>>>;
  quantity: number;
  unitCents: number;
};

async function resolveCartLines(
  locale: string,
  items: Array<{ sku: string; quantity: number }>,
  currency: ShopCurrency,
): Promise<{ lines: ResolvedCartLine[]; cartLines: CartOrderLine[]; amountCents: number; title: string }> {
  const lines: ResolvedCartLine[] = [];
  for (const item of items) {
    const product = await getProduct(item.sku, locale);
    if (!product) throw new Error(`商品不存在: ${item.sku}`);
    const quantity = item.quantity ?? 1;
    lines.push({
      product,
      quantity,
      unitCents: unitPrice(product, currency),
    });
  }

  const amountCents = lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0);
  const cartLines: CartOrderLine[] = lines.map((line) => ({
    sku: line.product.sku,
    quantity: line.quantity,
    name: line.product.name,
  }));
  const title = lines.length === 1
    ? (lines[0].quantity > 1 ? `${lines[0].product.name} ×${lines[0].quantity}` : lines[0].product.name)
    : cartLines
      .map((line) => (line.quantity > 1 ? `${line.name} ×${line.quantity}` : line.name))
      .join('、');

  return { lines, cartLines, amountCents, title };
}

/** 购物车合并结账 — 多件商品一笔订单 */
export async function createCartCheckoutOrder(
  req: NextRequest,
  input: CartStartCheckoutInput,
): Promise<StartCheckoutResult> {
  const locale = localeFromCheckoutRequest(req, input.locale);
  const currency: ShopCurrency = currencyForLocale(locale);
  const { lines, cartLines, amountCents, title } = await resolveCartLines(locale, input.items, currency);
  const orderNo = makeOrderNo();
  const needsShipping = lines.some(
    (line) => line.product.requiresShipping ?? inferRequiresShipping(line.product),
  );
  const cartContext = encodeCartOrderContext(cartLines);

  await syncOrderToAuth({
    userId: input.userId,
    orderNo,
    title,
    sku: lines.length === 1 ? lines[0].product.sku : SHOP_CART_ORDER_SKU,
    amountCents,
    currency: 'USDT',
    status: 'pending',
    appSource: input.appSource ?? 'shop',
    recommendationContext: lines.length === 1 ? undefined : cartContext,
  });

  const successUrl = input.successUrl
    ? `${input.successUrl}${input.successUrl.includes('?') ? '&' : '?'}order=${encodeURIComponent(orderNo)}`
    : `${ENV.shopUrl}/success?order=${orderNo}`;
  const cancelUrl = input.cancelUrl ?? `${ENV.shopUrl}/cart`;

  if (paymentsUseStripe() && !needsShipping) {
    const stripe = getStripe();
    if (stripe) {
      const stripeMeta: Record<string, string> = {
        orderNo,
        userId: String(input.userId),
        sku: lines.length === 1 ? lines[0].product.sku : SHOP_CART_ORDER_SKU,
        currency,
      };
      if (cartContext) stripeMeta.recommendationContext = cartContext.slice(0, 500);

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: stripeMeta,
        line_items: lines.map((line) => {
          const charge = toStripeAmount(
            { priceCents: line.product.priceCents, priceCentsUsd: line.product.priceCentsUsd },
            currency,
          );
          return {
            quantity: line.quantity,
            price_data: {
              currency: charge.currency,
              unit_amount: charge.unit_amount,
              product_data: { name: line.product.name, description: line.product.desc },
            },
          };
        }),
      });
      return {
        orderNo,
        checkoutUrl: session.url,
        provider: 'stripe',
        amountCents,
        title,
        needsShipping,
      };
    }
  }

  return {
    orderNo,
    checkoutUrl: mockCheckoutUrl(orderNo, input.successUrl),
    provider: 'mock',
    amountCents,
    title,
    needsShipping,
  };
}

/** 将 auth-service 响应中的 Set-Cookie 转发给浏览器 */
export function forwardSetCookies(authRes: Response, nextRes: NextResponse) {
  const raw = authRes.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = raw.getSetCookie?.() ?? [];
  for (const cookie of cookies) {
    nextRes.headers.append('Set-Cookie', cookie);
  }
  if (cookies.length === 0) {
    const single = authRes.headers.get('set-cookie');
    if (single) nextRes.headers.append('Set-Cookie', single);
  }
}

export async function proxyAuthCheckout(
  path: '/checkout-register' | '/checkout-bind',
  body: { email: string },
  cookieHeader?: string | null,
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cookieHeader) headers.cookie = cookieHeader;
  return fetch(`${ENV.authInternalUrl}/auth${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}
