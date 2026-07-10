import { NextRequest, NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { getSingleCardReading } from '@/lib/single-card/record';
import { getSingleCardQuota } from '@/lib/single-card-quota';
import { fetchTarotBillingConfig } from '@/lib/tarot-billing-config';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const ensured = await ensureAuthUser();
  const readingId = req.nextUrl.searchParams.get('readingId');

  const user = await prisma.user.findUnique({
    where: { id: ensured.userId },
    select: { email: true, nickname: true },
  });
  const loggedIn = await isOrasageLoggedIn(user?.email);
  const billing = await fetchTarotBillingConfig();
  const quota = await getSingleCardQuota(ensured.userId);

  let record = null;
  if (readingId) {
    record = await getSingleCardReading(ensured.userId, readingId);
  }

  const res = NextResponse.json({
    isLoggedIn: loggedIn,
    nickname: user?.nickname ?? null,
    quota,
    billing: {
      threeCardReport: billing.threeCardReport,
      threeCardBundle: billing.threeCardBundle,
      skus: billing.skus,
    },
    record,
  });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
