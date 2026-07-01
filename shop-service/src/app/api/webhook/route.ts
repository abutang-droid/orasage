import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { stripeEvents, orders } from '@/lib/schema';
import { getStripe } from '@/lib/stripe';
import { markOrderPaid } from '@/lib/orders';
import { jsonOk, jsonError } from '@/lib/api';

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return jsonError('webhook not configured', 503);
  }

  const stripe = getStripe();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return jsonError('missing signature', 400);

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    console.error('stripe webhook verify failed', e);
    return jsonError('invalid signature', 400);
  }

  const existing = await db
    .select()
    .from(stripeEvents)
    .where(eq(stripeEvents.stripeEventId, event.id))
    .limit(1);

  if (existing.length) {
    return jsonOk({ received: true, duplicate: true });
  }

  await db.insert(stripeEvents).values({
    stripeEventId: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = Number(session.metadata?.orderId);
    if (orderId) {
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
      await markOrderPaid(orderId, paymentIntentId);
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = Number(session.metadata?.orderId);
    if (orderId) {
      await db
        .update(orders)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }
  }

  await db
    .update(stripeEvents)
    .set({ processed: true })
    .where(eq(stripeEvents.stripeEventId, event.id));

  return jsonOk({ received: true });
}
