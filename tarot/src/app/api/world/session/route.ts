import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isWorldAuthRequired } from '@/lib/world-minikit';

/**
 * Whether the browser has a platform orasage_token (World SIWE session).
 * Used by WorldAuthGate — independent of tarot guest accounts.
 */
export async function GET(req: NextRequest) {
  const authBase = (
    process.env.AUTH_INTERNAL_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    'http://127.0.0.1:3101'
  ).replace(/\/$/, '');

  const cookieHeader = req.headers.get('cookie') || '';
  let loggedIn = false;
  let sub: string | null = null;

  try {
    const res = await fetch(`${authBase}/verify`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      cache: 'no-store',
    });
    if (res.ok) {
      const data = (await res.json()) as { valid?: boolean; sub?: string };
      loggedIn = Boolean(data.valid ?? data.sub);
      sub = data.sub ?? null;
    }
  } catch {
    loggedIn = false;
  }

  // Also accept explicit Bearer for local debugging
  if (!loggedIn) {
    const jar = await cookies();
    const parent = jar.get(process.env.PARENT_AUTH_COOKIE_NAME || 'orasage_token')?.value;
    loggedIn = Boolean(parent);
  }

  return NextResponse.json({
    loggedIn,
    sub,
    worldAuthRequired: isWorldAuthRequired(),
  });
}
