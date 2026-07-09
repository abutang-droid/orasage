import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';
import { estimateShippingFeeCents } from '../../../../../../shared/shop-fulfillment/index';

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get('country') ?? 'CN';
  const recipients = req.nextUrl.searchParams.get('recipients') ?? '1';
  const weightGrams = req.nextUrl.searchParams.get('weightGrams');
  const qs = new URLSearchParams({ country, recipients });
  if (weightGrams) qs.set('weightGrams', weightGrams);

  try {
    const res = await fetch(`${ENV.authInternalUrl}/api/shipping/estimate?${qs}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('[shop] shipping estimate fallback:', err);
  }

  const feeCents = estimateShippingFeeCents(
    country,
    Math.max(1, Number(recipients) || 1),
    weightGrams != null && weightGrams !== '' ? Number(weightGrams) : null,
  );
  return NextResponse.json({
    feeCents,
    country,
    recipients: Math.max(1, Number(recipients) || 1),
    weightGrams: weightGrams != null && weightGrams !== '' ? Number(weightGrams) : null,
    fallback: true,
  });
}
