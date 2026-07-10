import { dateKeyUTC } from '@/lib/merit';

export { dateKeyUTC as dailyFortuneDateKey };

export const DAILY_FORTUNE_BASE_ALLOWANCE = 1;

export type DailyFortuneQuota = {
  dateKey: string;
  baseAllowance: number;
  allowance: number;
  drawsUsed: number;
  remaining: number;
};

export async function getOrCreateDailyFortuneDay(userId: string, dateKey = dateKeyUTC()) {
  const { prisma } = await import('@/lib/prisma');
  return prisma.dailyFortuneDay.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    create: { userId, dateKey, drawsUsed: 0, templeBonusGranted: false },
    update: {},
  });
}

export async function getDailyFortuneQuota(userId: string): Promise<DailyFortuneQuota> {
  const day = await getOrCreateDailyFortuneDay(userId);
  const allowance = DAILY_FORTUNE_BASE_ALLOWANCE;
  const remaining = Math.max(0, allowance - day.drawsUsed);
  return {
    dateKey: day.dateKey,
    baseAllowance: DAILY_FORTUNE_BASE_ALLOWANCE,
    allowance,
    drawsUsed: day.drawsUsed,
    remaining,
  };
}

export type DailyFortuneAccess =
  | { ok: true; source: 'free_base'; remaining: number }
  | { ok: false; reason: 'already_drew_today'; remaining: 0 };

export async function consumeDailyFortuneDraw(userId: string): Promise<DailyFortuneAccess> {
  const day = await getOrCreateDailyFortuneDay(userId);
  if (day.drawsUsed >= DAILY_FORTUNE_BASE_ALLOWANCE) {
    return { ok: false, reason: 'already_drew_today', remaining: 0 };
  }

  const { prisma } = await import('@/lib/prisma');
  await prisma.dailyFortuneDay.update({
    where: { id: day.id },
    data: { drawsUsed: { increment: 1 } },
  });
  return { ok: true, source: 'free_base', remaining: 0 };
}
