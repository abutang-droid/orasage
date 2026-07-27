import { NextRequest, NextResponse } from 'next/server';

function authInternalBase(): string {
  return (
    process.env.AUTH_INTERNAL_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    'http://127.0.0.1:3101'
  ).replace(/\/$/, '');
}

function cookieDomain(): string | undefined {
  const raw =
    process.env.COOKIE_DOMAIN ||
    process.env.JWT_COOKIE_DOMAIN ||
    process.env.NEXT_PUBLIC_SITE_APEX ||
    process.env.SITE_APEX ||
    '';
  const apex = raw.replace(/^\./, '').trim();
  return apex ? `.${apex}` : undefined;
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

  // Belt-and-suspenders: if upstream Set-Cookie was stripped, set orasage_token from JSON.
  if (res.ok) {
    try {
      const data = JSON.parse(text) as { token?: string };
      if (data.token) {
        out.cookies.set({
          name: process.env.PARENT_AUTH_COOKIE_NAME || 'orasage_token',
          value: data.token,
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          domain: cookieDomain(),
          maxAge: 30 * 24 * 60 * 60,
        });
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}
