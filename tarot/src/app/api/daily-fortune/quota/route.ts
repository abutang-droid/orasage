import { NextResponse } from 'next/server';
import { getAuthUser, ensureAuthUser } from '@/lib/auth';
import { getDailyFortuneQuota } from '@/lib/daily-fortune-quota';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({
      requiresAuth: false,
      dateKey: null,
      allowance: 1,
      remaining: null,
      drawsUsed: 0,
      templeBonusGranted: false,
    });
  }
  const quota = await getDailyFortuneQuota(auth.userId);
  return NextResponse.json({
    requiresAuth: true,
    ...quota,
  });
}

export async function POST(req: Request) {
  const ensured = await ensureAuthUser();
  const body = await req.json().catch(() => ({}));
  const orderNo = typeof body.orderNo === 'string' ? body.orderNo.trim() : null;

  const { consumeDailyFortuneDraw } = await import('@/lib/daily-fortune-quota');
  const access = await consumeDailyFortuneDraw(ensured.userId, { orderNo });

  const { setAuthCookie } = await import('@/lib/auth');
  const res = NextResponse.json(
    access.ok
      ? { ok: true, source: access.source, remaining: access.remaining }
      : { ok: false, error: 'paywall', sku: access.sku, remaining: 0 },
    { status: access.ok ? 200 : 402 },
  );
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
