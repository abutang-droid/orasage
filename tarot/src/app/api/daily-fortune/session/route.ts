import { NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { listTodayDailyFortuneRecords } from '@/lib/daily-fortune/record';
import { getDailyFortuneQuota } from '@/lib/daily-fortune-quota';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const ensured = await ensureAuthUser();
  const user = await prisma.user.findUnique({
    where: { id: ensured.userId },
    select: { email: true, nickname: true },
  });
  const quota = await getDailyFortuneQuota(ensured.userId);
  const loggedIn = await isOrasageLoggedIn(user?.email);
  const records = (await listTodayDailyFortuneRecords(ensured.userId, quota.dateKey)).map((r) => ({
    ...r,
    fullReport: loggedIn ? r.fullReport : null,
  }));

  const res = NextResponse.json({
    quota,
    records,
    latest: records[0] ?? null,
    isLoggedIn: loggedIn,
    nickname: user?.nickname ?? null,
  });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
