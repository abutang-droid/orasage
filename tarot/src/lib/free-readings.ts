import { prisma } from '@/lib/prisma';
import {
  dateKeyUTC,
  FREE_READING_GRANTS,
  getMeritLevel,
  LEVEL_MONTHLY_FREE_READINGS,
} from '@/lib/merit';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export type ReadingAccess =
  | { ok: true; source: 'free_credit' | 'paid_order' | 'guest'; remaining: number }
  | { ok: false; reason: 'paywall'; remaining: 0; sku: string };

export async function getFreeReadingsRemaining(userId: string): Promise<number> {
  await ensureInitialFreeReading(userId);
  await maybeGrantMonthlyLevelFreeReadings(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeReadingsRemaining: true },
  });
  return user?.freeReadingsRemaining ?? 0;
}

export async function grantFreeReadings(
  userId: string,
  count: number,
  reason: string,
  idempotencyKey: string,
): Promise<{ granted: boolean; remaining: number }> {
  if (count <= 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeReadingsRemaining: true },
    });
    return { granted: false, remaining: user?.freeReadingsRemaining ?? 0 };
  }

  const dup = await prisma.meritLog.findUnique({ where: { idempotencyKey } });
  if (dup) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeReadingsRemaining: true },
    });
    return { granted: false, remaining: user?.freeReadingsRemaining ?? 0 };
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.meritLog.create({
      data: {
        userId,
        path: 'time',
        amount: 0,
        reason: `free_reading_grant:${reason}`,
        idempotencyKey,
      },
    });
    return tx.user.update({
      where: { id: userId },
      data: { freeReadingsRemaining: { increment: count } },
      select: { freeReadingsRemaining: true },
    });
  });

  return { granted: true, remaining: updated.freeReadingsRemaining };
}

export async function ensureInitialFreeReading(userId: string): Promise<void> {
  await grantFreeReadings(
    userId,
    FREE_READING_GRANTS.initial,
    'initial_signup',
    `free_grant:initial:${userId}`,
  );
}

export async function maybeGrantMonthlyLevelFreeReadings(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { meritTotal: true, freeReadingsGrantMonth: true },
  });
  if (!user) return;

  const level = getMeritLevel(user.meritTotal).level;
  const monthly = LEVEL_MONTHLY_FREE_READINGS[level];
  if (!monthly) return;

  const month = dateKeyUTC().slice(0, 7);
  if (user.freeReadingsGrantMonth === month) return;

  const { granted } = await grantFreeReadings(
    userId,
    monthly,
    `monthly_level_${level}`,
    `free_grant:monthly:${userId}:${month}`,
  );
  if (granted) {
    await prisma.user.update({
      where: { id: userId },
      data: { freeReadingsGrantMonth: month },
    });
  }
}

/** 连续参拜第 7 天 / onboarding 第 7 次参拜 — 赠送一次免费深度占卜 */
export async function maybeGrantWorshipDay7FreeReading(
  userId: string,
  streakDays: number,
  checkinCount: number,
): Promise<void> {
  if (streakDays !== 7 && checkinCount !== 7) return;
  const today = dateKeyUTC();
  await grantFreeReadings(
    userId,
    FREE_READING_GRANTS.worshipDay7,
    'worship_day7',
    `free_grant:worship_day7:${userId}:${today}`,
  );
}

export async function consumeFreeReading(userId: string): Promise<{ ok: true; remaining: number } | { ok: false; reason: 'no_free_readings' }> {
  await ensureInitialFreeReading(userId);
  await maybeGrantMonthlyLevelFreeReadings(userId);

  const result = await prisma.user.updateMany({
    where: { id: userId, freeReadingsRemaining: { gte: 1 } },
    data: { freeReadingsRemaining: { decrement: 1 } },
  });
  if (result.count === 0) return { ok: false, reason: 'no_free_readings' };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeReadingsRemaining: true },
  });
  return { ok: true, remaining: user?.freeReadingsRemaining ?? 0 };
}

export async function verifyPaidTarotReadingOrder(orderNo: string, tarotUserId: string): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_INTERNAL}/internal/orders/${encodeURIComponent(orderNo)}`, {
      headers: { 'x-real-ip': '127.0.0.1' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    const order = data.order;
    if (!order || order.status !== 'paid' || order.appSource !== 'tarot') return false;
    const sku = String(order.sku ?? '').toLowerCase();
    if (sku.includes('crystal')) return false;
    const match = String(order.recommendationContext ?? '').match(/tarotUser:([^|]+)/);
    return match?.[1] === tarotUserId;
  } catch {
    return false;
  }
}

export async function markPaidReadingOrderUsed(orderNo: string, userId: string): Promise<void> {
  const idempotencyKey = `reading:paid:${orderNo}`;
  const dup = await prisma.meritLog.findUnique({ where: { idempotencyKey } });
  if (dup) return;
  await prisma.meritLog.create({
    data: {
      userId,
      path: 'offer',
      amount: 0,
      reason: 'paid_reading_consumed',
      idempotencyKey,
    },
  });
}

export async function isPaidReadingOrderUsed(orderNo: string): Promise<boolean> {
  const row = await prisma.meritLog.findUnique({
    where: { idempotencyKey: `reading:paid:${orderNo}` },
  });
  return !!row;
}

export async function resolveReadingAccess(
  userId: string | null,
  orderNo?: string | null,
): Promise<ReadingAccess> {
  if (!userId) {
    return { ok: true, source: 'guest', remaining: 0 };
  }

  if (orderNo) {
    const valid = await verifyPaidTarotReadingOrder(orderNo, userId);
    if (!valid) return { ok: false, reason: 'paywall', remaining: 0, sku: 'report-tarot' };
    const used = await isPaidReadingOrderUsed(orderNo);
    if (used) return { ok: false, reason: 'paywall', remaining: 0, sku: 'report-tarot' };
    await markPaidReadingOrderUsed(orderNo, userId);
    const remaining = await getFreeReadingsRemaining(userId);
    return { ok: true, source: 'paid_order', remaining };
  }

  const consumed = await consumeFreeReading(userId);
  if (!consumed.ok) {
    return { ok: false, reason: 'paywall', remaining: 0, sku: 'report-tarot' };
  }
  return { ok: true, source: 'free_credit', remaining: consumed.remaining };
}
