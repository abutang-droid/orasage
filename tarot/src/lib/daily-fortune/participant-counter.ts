import { dateKeyUTC } from '@/lib/merit';

/** 每日基础展示人数（UTC 自然日 00:00 起算） */
const DAILY_BASE_COUNT = 12_843;
/** 24 小时内随时间递增至约 +8,500 */
const DAILY_DRIFT_MAX = 8_500;

function msElapsedInUtcDay(dateKey: string, now = new Date()): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dayStart = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  return Math.max(0, now.getTime() - dayStart);
}

function driftForDate(dateKey: string, now = new Date()): number {
  const elapsed = msElapsedInUtcDay(dateKey, now);
  const dayMs = 24 * 60 * 60 * 1000;
  const progress = Math.min(1, elapsed / dayMs);
  return Math.floor(progress * DAILY_DRIFT_MAX);
}

export function computeParticipantDisplayCount(dateKey: string, extraClicks: number, now = new Date()): number {
  return DAILY_BASE_COUNT + driftForDate(dateKey, now) + extraClicks;
}

export async function getDailyInsightStats(dateKey = dateKeyUTC()) {
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.dailyInsightStats.findUnique({ where: { dateKey } });
  const extraClicks = row?.extraCount ?? 0;
  return {
    dateKey,
    displayCount: computeParticipantDisplayCount(dateKey, extraClicks),
    extraClicks,
  };
}

/** 用户点击进入或抽牌时 +1 */
export async function incrementDailyInsightParticipation(dateKey = dateKeyUTC()) {
  const { prisma } = await import('@/lib/prisma');
  const row = await prisma.dailyInsightStats.upsert({
    where: { dateKey },
    create: { dateKey, extraCount: 1 },
    update: { extraCount: { increment: 1 } },
  });
  return {
    dateKey,
    displayCount: computeParticipantDisplayCount(dateKey, row.extraCount),
    extraClicks: row.extraCount,
  };
}
