import { dateKeyUTC } from '@/lib/merit';

export const SINGLE_CARD_BASE_ALLOWANCE = 1;

export type SingleCardQuota = {
  dateKey: string;
  baseAllowance: number;
  templeBonusGranted: boolean;
  templeFreeReportAvailable: boolean;
  allowance: number;
  drawsUsed: number;
  remaining: number;
};

export async function getOrCreateSingleCardDay(userId: string, dateKey = dateKeyUTC()) {
  const { prisma } = await import('@/lib/prisma');
  return prisma.singleCardDay.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    create: { userId, dateKey, drawsUsed: 0, templeBonusGranted: false },
    update: {},
  });
}

export async function getSingleCardQuota(userId: string): Promise<SingleCardQuota> {
  const day = await getOrCreateSingleCardDay(userId);
  const allowance = SINGLE_CARD_BASE_ALLOWANCE + (day.templeBonusGranted ? 1 : 0);
  const remaining = Math.max(0, allowance - day.drawsUsed);
  const templeFreeReportAvailable = day.templeBonusGranted && !day.templeFreeReportUsed;
  return {
    dateKey: day.dateKey,
    baseAllowance: SINGLE_CARD_BASE_ALLOWANCE,
    templeBonusGranted: day.templeBonusGranted,
    templeFreeReportAvailable,
    allowance,
    drawsUsed: day.drawsUsed,
    remaining,
  };
}

/** 当日首次祈福完成时调用，每自然日仅生效一次 */
export async function grantSingleCardTempleBonus(userId: string, dateKey = dateKeyUTC()) {
  const { prisma } = await import('@/lib/prisma');
  await prisma.singleCardDay.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    create: { userId, dateKey, drawsUsed: 0, templeBonusGranted: true, templeFreeReportUsed: false },
    update: { templeBonusGranted: true },
  });
}

/** 消耗当日祈福赠送的免费详读次数（每自然日 1 次） */
export async function consumeTempleFreeReport(userId: string, dateKey = dateKeyUTC()) {
  const { prisma } = await import('@/lib/prisma');
  const day = await prisma.singleCardDay.findUnique({
    where: { userId_dateKey: { userId, dateKey } },
  });
  if (!day?.templeBonusGranted || day.templeFreeReportUsed) {
    return { ok: false as const };
  }
  await prisma.singleCardDay.update({
    where: { id: day.id },
    data: { templeFreeReportUsed: true },
  });
  return { ok: true as const, dateKey };
}

export type SingleCardAccessSource = 'free_base' | 'temple_bonus';

export type SingleCardAccess =
  | { ok: true; source: SingleCardAccessSource; remaining: number }
  | { ok: false; reason: 'quota_exhausted'; remaining: 0 };

function resolveConsumeSource(drawsUsed: number, templeBonusGranted: boolean): SingleCardAccessSource {
  if (drawsUsed === 0) return 'free_base';
  return 'temple_bonus';
}

export async function consumeSingleCardDraw(userId: string): Promise<SingleCardAccess> {
  const day = await getOrCreateSingleCardDay(userId);
  const allowance = SINGLE_CARD_BASE_ALLOWANCE + (day.templeBonusGranted ? 1 : 0);
  if (day.drawsUsed >= allowance) {
    return { ok: false, reason: 'quota_exhausted', remaining: 0 };
  }

  const source = resolveConsumeSource(day.drawsUsed, day.templeBonusGranted);
  const { prisma } = await import('@/lib/prisma');
  const updated = await prisma.singleCardDay.update({
    where: { id: day.id },
    data: { drawsUsed: { increment: 1 } },
  });
  const remaining = Math.max(0, allowance - updated.drawsUsed);
  return { ok: true, source, remaining };
}
