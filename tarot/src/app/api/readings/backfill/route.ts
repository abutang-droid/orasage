import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { backfillTarotReadings } from '@/lib/reading-sync-backfill';
import { prisma } from '@/lib/prisma';

const bodySchema = z
  .object({
    dailyLimit: z.number().int().min(1).max(50).optional(),
    threeCardLimit: z.number().int().min(1).max(50).optional(),
    legacyLimit: z.number().int().min(0).max(30).optional(),
  })
  .optional();

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const user = await prisma.user.findUnique({
      where: { id: ensured.userId },
      select: { email: true },
    });
    const loggedIn = await isOrasageLoggedIn(user?.email);

    if (!loggedIn) {
      const res = NextResponse.json(
        { ok: false, error: 'login_required' },
        { status: 401 },
      );
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const body = bodySchema.parse(await req.json().catch(() => undefined));
    const result = await backfillTarotReadings({
      cookieHeader: req.headers.get('cookie'),
      userId: ensured.userId,
      loggedIn,
      limits: {
        daily: body?.dailyLimit,
        threeCard: body?.threeCardLimit,
        legacy: body?.legacyLimit,
      },
    });

    const res = NextResponse.json(result);
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[readings/backfill]', err);
    return NextResponse.json({ error: '补同步失败' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ensured = await ensureAuthUser();
  const user = await prisma.user.findUnique({
    where: { id: ensured.userId },
    select: { email: true },
  });
  const loggedIn = await isOrasageLoggedIn(user?.email);

  const [daily, threeCard, legacyTotal, legacyDone] = await Promise.all([
    prisma.dailyFortuneRecord.count({
      where: {
        userId: ensured.userId,
        readingSyncId: null,
        briefText: { not: null },
      },
    }),
    prisma.threeCardReading.count({
      where: { userId: ensured.userId, readingSyncId: null },
    }),
    prisma.readingRecord.count({ where: { userId: ensured.userId } }),
    prisma.meritLog.findUnique({
      where: { idempotencyKey: `reading_backfill:legacy:${ensured.userId}` },
    }),
  ]);

  const res = NextResponse.json({
    isLoggedIn: loggedIn,
    pending: { daily, threeCard, legacy: legacyDone ? 0 : legacyTotal },
  });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
