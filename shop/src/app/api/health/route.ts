import { NextResponse } from 'next/server';
import { paymentsUseStripe, resolvePaymentMode } from '@/lib/payment-mode';

export async function GET() {
  const paymentMode = resolvePaymentMode();
  return NextResponse.json({
    status: 'ok',
    service: 'orasage-shop',
    port: 3102,
    paymentMode,
    stripeEnabled: paymentsUseStripe(),
  });
}
