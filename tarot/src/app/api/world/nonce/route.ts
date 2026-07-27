import { NextResponse } from 'next/server';

function authInternalBase(): string {
  return (
    process.env.AUTH_INTERNAL_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    'http://127.0.0.1:3101'
  ).replace(/\/$/, '');
}

/**
 * Same-origin proxy for World SIWE nonce.
 * Avoids CORS / cross-subdomain cookie issues inside World App webview.
 */
export async function GET() {
  const res = await fetch(`${authInternalBase()}/auth/world/nonce`, {
    cache: 'no-store',
  });
  const body = await res.text();
  const out = new NextResponse(body, {
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
