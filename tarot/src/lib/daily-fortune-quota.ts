import { dateKeyUTC } from '@/lib/merit';

export { dateKeyUTC as dailyFortuneDateKey };

export const DAILY_FORTUNE_BASE_ALLOWANCE = 1;

export type DailyFortuneQuota = {
  dateKey: string;
  baseAllowance: number;
  templeBonusGranted: boolean;
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
  const allowance = DAILY_FORTUNE_BASE_ALLOWANCE + (day.templeBonusGranted ? 1 : 0);
  const remaining = Math.max(0, allowance - day.drawsUsed);
  return {
    dateKey: day.dateKey,
    baseAllowance: DAILY_FORTUNE_BASE_ALLOWANCE,
    templeBonusGranted: day.templeBonusGranted,
    allowance,
    drawsUsed: day.drawsUsed,
    remaining,
  };
}

/** 当日首次祈福完成时调用，每自然日仅生效一次 */
export async function grantDailyFortuneTempleBonus(userId: string, dateKey = dateKeyUTC()) {
  const { prisma } = await import('@/lib/prisma');
  await prisma.dailyFortuneDay.upsert({
    where: { userId_dateKey: { userId, dateKey } },
    create: { userId, dateKey, drawsUsed: 0, templeBonusGranted: true },
    update: { templeBonusGranted: true },
  });
}

export type DailyFortuneAccessSource = 'free_base' | 'temple_bonus' | 'paid_order';

export type DailyFortuneAccess =
  | { ok: true; source: DailyFortuneAccessSource; remaining: number }
  | { ok: false; reason: 'paywall'; sku: string; remaining: 0 };

function resolveConsumeSource(drawsUsed: number, templeBonusGranted: boolean): DailyFortuneAccessSource {
  if (drawsUsed === 0) return 'free_base';
  if (drawsUsed === 1 && templeBonusGranted) return 'temple_bonus';
  return 'paid_order';
}

export async function consumeDailyFortuneDraw(
  userId: string,
  opts?: { orderNo?: string | null; paidSku?: string },
): Promise<DailyFortuneAccess & { source?: DailyFortuneAccessSource }> {
  const { fetchTarotBillingSkus } = await import('@/lib/tarot-billing-config');
  const { verifyPaidTarotOrder } = await import('@/lib/three-card-access');

  if (opts?.orderNo) {
    const skus = await fetchTarotBillingSkus();
    const valid = await verifyPaidTarotOrder(opts.orderNo, userId, skus.dailyOverageSku);
    if (!valid) {
      return { ok: false, reason: 'paywall', sku: skus.dailyOverageSku, remaining: 0 };
    }
    const used = await isDailyFortuneOrderUsed(opts.orderNo);
    if (used) {
      return { ok: false, reason: 'paywall', sku: skus.dailyOverageSku, remaining: 0 };
    }
    await markDailyFortuneOrderUsed(opts.orderNo, userId);
    const quota = await getDailyFortuneQuota(userId);
    return { ok: true, source: 'paid_order', remaining: quota.remaining };
  }

  const day = await getOrCreateDailyFortuneDay(userId);
  const allowance = DAILY_FORTUNE_BASE_ALLOWANCE + (day.templeBonusGranted ? 1 : 0);
  if (day.drawsUsed >= allowance) {
    const skus = await fetchTarotBillingSkus();
    return { ok: false, reason: 'paywall', sku: skus.dailyOverageSku, remaining: 0 };
  }

  const source = resolveConsumeSource(day.drawsUsed, day.templeBonusGranted);
  const { prisma } = await import('@/lib/prisma');
  const updated = await prisma.dailyFortuneDay.update({
    where: { id: day.id },
    data: { drawsUsed: { increment: 1 } },
  });
  const remaining = Math.max(0, allowance - updated.drawsUsed);
  return { ok: true, source, remaining };
}

async function isDailyFortuneOrderUsed(orderNo: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.meritLog.findUnique({
    where: { idempotencyKey: `daily_fortune:paid:${orderNo}` },
  });
  return !!row;
}

async function markDailyFortuneOrderUsed(orderNo: string, userId: string): Promise<void> {
  const { prisma } = await import('@/lib/prisma');
  const idempotencyKey = `daily_fortune:paid:${orderNo}`;
  const dup = await prisma.meritLog.findUnique({ where: { idempotencyKey } });
  if (dup) return;
  await prisma.meritLog.create({
    data: {
      userId,
      path: 'offer',
      amount: 0,
      reason: 'daily_fortune_paid_consumed',
      idempotencyKey,
    },
  });
}
