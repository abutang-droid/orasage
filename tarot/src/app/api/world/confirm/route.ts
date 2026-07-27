import { NextRequest, NextResponse } from 'next/server';

function shopInternalBase(): string {
  return (
    process.env.SHOP_INTERNAL_URL ||
    process.env.SHOP_URL ||
    process.env.NEXT_PUBLIC_SHOP_URL ||
    'http://127.0.0.1:3102'
  ).replace(/\/$/, '');
}

/** Same-origin BFF for World MiniKit.pay confirmation. */
export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  const body = await req.text();
  const res = await fetch(`${shopInternalBase()}/api/world/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      'x-real-ip': '127.0.0.1',
    },
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
}
