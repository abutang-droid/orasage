import { NextRequest, NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { resolveThreeCardReportAccess } from '@/lib/three-card-access';

export async function POST(req: NextRequest) {
  const ensured = await ensureAuthUser();
  const body = await req.json().catch(() => ({}));
  const orderNo = typeof body.orderNo === 'string' ? body.orderNo.trim() : null;

  const access = await resolveThreeCardReportAccess(ensured.userId, orderNo);
  const res = NextResponse.json(
    access.ok
      ? { ok: true, tier: access.tier, orderNo: access.orderNo }
      : { ok: false, error: 'paywall', skus: access.skus },
    { status: access.ok ? 200 : 402 },
  );
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
