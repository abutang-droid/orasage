import { eq, desc, and, asc } from 'drizzle-orm';
import { db } from './db';
import {
  products,
  orders,
  orderItems,
  entitlements,
  type Product,
} from './schema';
import { getStripe, isStripeConfigured } from './stripe';
import { enqueueFulfillment } from './queue';

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `OS-${ts}-${rand}`;
}

export function productSnapshot(product: Product): Record<string, unknown> {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    type: product.type,
    appSource: product.appSource,
    priceCents: product.priceCents,
    currency: product.currency,
    metadata: product.metadata,
  };
}

export interface CheckoutItemInput {
  productId: number;
  quantity?: number;
}

export interface CreateCheckoutInput {
  userId: number;
  items: CheckoutItemInput[];
  sourceApp?: 'shop' | 'bazi' | 'ziwei' | 'tarot' | 'admin';
  recommendationContext?: Record<string, unknown>;
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  const lineItems: Array<{
    product: Product;
    quantity: number;
  }> = [];

  for (const item of input.items) {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, item.productId), eq(products.active, true)))
      .limit(1);

    if (!product) {
      throw new CheckoutError(`product ${item.productId} not found or inactive`);
    }

    lineItems.push({ product, quantity: item.quantity ?? 1 });
  }

  if (!lineItems.length) {
    throw new CheckoutError('no items in checkout');
  }

  const totalCents = lineItems.reduce(
    (sum, li) => sum + li.product.priceCents * li.quantity,
    0,
  );
  const currency = lineItems[0]!.product.currency;
  const orderNumber = generateOrderNumber();
  const sourceApp = input.sourceApp ?? 'shop';

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: input.userId,
      status: 'pending',
      totalCents,
      currency,
      sourceApp,
      recommendationContext: input.recommendationContext ?? {},
      customerEmail: input.customerEmail,
      metadata: { createdVia: 'checkout' },
    })
    .returning();

  for (const li of lineItems) {
    await db.insert(orderItems).values({
      orderId: order!.id,
      productId: li.product.id,
      quantity: li.quantity,
      unitPriceCents: li.product.priceCents,
      productSnapshot: productSnapshot(li.product),
    });
  }

  if (!isStripeConfigured()) {
    return {
      order,
      mode: 'mock' as const,
      checkoutUrl: `${process.env.SHOP_URL ?? 'http://localhost:3102'}/checkout/success?order=${orderNumber}&mock=1`,
    };
  }

  const stripe = getStripe();
  const shopUrl = process.env.SHOP_URL ?? 'https://shop.orasage.com';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.customerEmail,
    line_items: lineItems.map((li) => ({
      quantity: li.quantity,
      price_data: {
        currency: li.product.currency,
        unit_amount: li.product.priceCents,
        product_data: {
          name: li.product.name,
          description: li.product.description ?? undefined,
          images: li.product.imageUrl ? [li.product.imageUrl] : undefined,
          metadata: {
            productId: String(li.product.id),
            slug: li.product.slug,
          },
        },
      },
    })),
    success_url:
      input.successUrl ??
      `${shopUrl}/checkout/success?order=${orderNumber}`,
    cancel_url: input.cancelUrl ?? `${shopUrl}/products`,
    metadata: {
      orderId: String(order!.id),
      orderNumber,
      userId: String(input.userId),
      sourceApp,
    },
  });

  await db
    .update(orders)
    .set({ stripeSessionId: session.id, updatedAt: new Date() })
    .where(eq(orders.id, order!.id));

  return {
    order,
    mode: 'stripe' as const,
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

export async function markOrderPaid(orderId: number, paymentIntentId?: string) {
  const [order] = await db
    .update(orders)
    .set({
      status: 'paid',
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  for (const item of items) {
    const snapshot = item.productSnapshot as { slug?: string; type?: string };
    await db.insert(entitlements).values({
      userId: order.userId,
      productId: item.productId,
      orderId: order.id,
      entitlementKey: `${snapshot.slug ?? item.productId}:${order.userId}`,
      metadata: {
        quantity: item.quantity,
        sourceApp: order.sourceApp,
      },
    });
  }

  await enqueueFulfillment({
    orderId: order.id,
    userId: order.userId,
    sourceApp: order.sourceApp,
    recommendationContext: (order.recommendationContext as Record<string, unknown>) ?? {},
  });

  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  return order ?? null;
}

export async function getOrderById(orderId: number) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  return order ?? null;
}

export async function listUserOrders(userId: number) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function listActiveProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.sortOrder), asc(products.id));
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.active, true)))
    .limit(1);
  return product ?? null;
}

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutError';
  }
}
