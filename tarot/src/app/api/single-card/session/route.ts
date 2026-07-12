import { NextRequest, NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { getSingleCardReading } from '@/lib/single-card/record';
import { isDestinySliceUnlocked, tryUnlockFromOrder } from '@/lib/single-card-unlock';
import { fetchTarotBillingConfig } from '@/lib/tarot-billing-config';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const ensured = await ensureAuthUser();
  const readingId = req.nextUrl.searchParams.get('readingId');
  const orderParam = req.nextUrl.searchParams.get('order');

  const user = await prisma.user.findUnique({
    where: { id: ensured.userId },
    select: { email: true, nickname: true },
  });
  const loggedIn = await isOrasageLoggedIn(user?.email);
  const billing = await fetchTarotBillingConfig();

  let unlocked = await isDestinySliceUnlocked(ensured.userId);
  if (!unlocked && orderParam && loggedIn) {
    unlocked = await tryUnlockFromOrder(
      ensured.userId,
      orderParam,
      billing.skus.destinySliceUnlockSku,
    );
  }

  let record = null;
  if (readingId) {
    record = await getSingleCardReading(ensured.userId, readingId);
  }

  const res = NextResponse.json({
    isLoggedIn: loggedIn,
    nickname: user?.nickname ?? null,
    unlocked,
    billing: {
      destinySliceUnlock: billing.destinySliceUnlock,
      skus: { destinySliceUnlockSku: billing.skus.destinySliceUnlockSku },
    },
    record,
  });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
