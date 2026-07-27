import { NextRequest, NextResponse } from 'next/server';

function shopInternalBase(): string {
  return (
    process.env.SHOP_INTERNAL_URL ||
    process.env.SHOP_URL ||
    process.env.NEXT_PUBLIC_SHOP_URL ||
    'http://127.0.0.1:3102'
  ).replace(/\/$/, '');
}

/**
 * Same-origin BFF for World pay intent (avoids Safari CORS "Load failed"
 * when tarot → shop.oricosmos.com with credentials).
 */
export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  const order = req.nextUrl.searchParams.get('order') || '';
  const successUrl = req.nextUrl.searchParams.get('successUrl');
  const qs = new URLSearchParams();
  if (order) qs.set('order', order);
  if (successUrl) qs.set('successUrl', successUrl);

  const res = await fetch(`${shopInternalBase()}/api/world/pay-intent?${qs}`, {
    method: 'GET',
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      'x-real-ip': '127.0.0.1',
    },
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
}
