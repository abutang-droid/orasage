import { NextRequest, NextResponse } from 'next/server';

function authInternalBase(): string {
  return (
    process.env.AUTH_INTERNAL_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    'http://127.0.0.1:3101'
  ).replace(/\/$/, '');
}

/** Same-origin BFF: signed RP context for IDKit. */
export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  const body = await req.text().catch(() => '{}');
  const res = await fetch(`${authInternalBase()}/auth/world/idkit/rp-context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: body || '{}',
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
}
