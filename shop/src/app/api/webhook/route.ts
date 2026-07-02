import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';
import { getStripe } from '@/lib/stripe';
import { updateOrderStatus } from '@/lib/orders';
import { dispatchReportJob } from '@/lib/reportJob';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe || !ENV.stripeWebhookSecret) {
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, ENV.stripeWebhookSecret);
  } catch (err) {
    console.error('[webhook] signature error:', err);
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderNo = session.metadata?.orderNo;
    if (orderNo) {
      try {
        await updateOrderStatus(orderNo, 'paid');
        await dispatchReportJob({
          orderNo,
          userId: Number(session.metadata?.userId),
          sku: session.metadata?.sku,
          readingId: session.metadata?.readingId,
        });
      } catch (err) {
        console.error('[webhook] order sync error:', err);
        return NextResponse.json({ error: 'order sync failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
