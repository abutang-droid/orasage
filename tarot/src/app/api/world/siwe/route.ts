import { NextRequest, NextResponse } from 'next/server';

function authInternalBase(): string {
  return (
    process.env.AUTH_INTERNAL_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    'http://127.0.0.1:3101'
  ).replace(/\/$/, '');
}

/**
 * Same-origin proxy for World SIWE complete.
 * Forwards cookies both ways so world_siwe_nonce + orasage_token work.
 */
export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  const body = await req.text();
  const res = await fetch(`${authInternalBase()}/auth/world/siwe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  const out = new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
  const setCookies =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : res.headers.get('set-cookie')
        ? [res.headers.get('set-cookie')!]
        : [];
  for (const c of setCookies) {
    if (c) out.headers.append('Set-Cookie', c);
  }
  return out;
}
