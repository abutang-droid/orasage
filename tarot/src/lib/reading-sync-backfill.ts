import type { ReadingSyncPayload } from '../../../shared/reading-sync/sync';
import { listUnsyncedDailyFortuneRecords } from '@/lib/daily-fortune/record';
import { maybeSyncDailyFortuneReading } from '@/lib/daily-fortune/sync';
import { listUnsyncedThreeCardReadings } from '@/lib/three-card/record';
import { maybeSyncThreeCardReading } from '@/lib/three-card/sync';
import { prisma } from '@/lib/prisma';
import { syncReadingFromServer } from '@/lib/reading-sync-server';

export type ReadingBackfillResult = {
  ok: boolean;
  dailySynced: number;
  threeCardSynced: number;
  legacySynced: number;
  failed: number;
  remaining: {
    daily: number;
    threeCard: number;
    legacy: number;
  };
};

const DEFAULT_LIMITS = {
  daily: 25,
  threeCard: 25,
  legacy: 15,
};

type LegacyCard = {
  cardName?: string;
  orientation?: string;
};

function buildLegacyReadingPayload(record: {
  id: string;
  spreadType: string;
  question: string | null;
  cards: unknown;
  conclusion: string | null;
  createdAt: Date;
}): ReadingSyncPayload {
  const cards = Array.isArray(record.cards) ? (record.cards as LegacyCard[]) : [];
  const cardLine = cards
    .map((c) => `${c.cardName ?? '牌'}(${c.orientation ?? '正位'})`)
    .join(' · ');
  const question = record.question?.trim() || '当下指引';
  const spreadLabel =
    record.spreadType === 'three'
      ? '三牌阵'
      : record.spreadType === 'single'
        ? '单牌'
        : record.spreadType;

  return {
    appSource: 'tarot',
    readingId: `tarot:legacy:${record.id}`,
    title: `塔罗${spreadLabel} · ${question.slice(0, 40)}`,
    summary: record.conclusion?.slice(0, 500) || cardLine || question,
    payloadJson: JSON.stringify({
      type: 'legacy_reading',
      recordId: record.id,
      spreadType: record.spreadType,
      question: record.question,
      cards,
      conclusion: record.conclusion,
      createdAt: record.createdAt.toISOString(),
    }),
  };
}

async function hasLegacyBackfillDone(userId: string): Promise<boolean> {
  const row = await prisma.meritLog.findUnique({
    where: { idempotencyKey: `reading_backfill:legacy:${userId}` },
  });
  return !!row;
}

async function markLegacyBackfillDone(userId: string) {
  const key = `reading_backfill:legacy:${userId}`;
  const dup = await prisma.meritLog.findUnique({ where: { idempotencyKey: key } });
  if (dup) return;
  await prisma.meritLog.create({
    data: {
      userId,
      path: 'offer',
      amount: 0,
      reason: 'legacy_reading_backfill',
      idempotencyKey: key,
    },
  });
}

async function backfillLegacyReadings(
  cookieHeader: string | null | undefined,
  userId: string,
  limit: number,
): Promise<{ synced: number; failed: number; skipped: boolean }> {
  if (await hasLegacyBackfillDone(userId)) {
    return { synced: 0, failed: 0, skipped: true };
  }

  const rows = await prisma.readingRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  if (rows.length === 0) {
    await markLegacyBackfillDone(userId);
    return { synced: 0, failed: 0, skipped: false };
  }

  let synced = 0;
  let failed = 0;

  for (const row of rows) {
    const payload = buildLegacyReadingPayload(row);
    const syncId = await syncReadingFromServer(cookieHeader, payload);
    if (syncId) synced += 1;
    else failed += 1;
  }

  await markLegacyBackfillDone(userId);
  return { synced, failed, skipped: false };
}

export async function backfillTarotReadings(input: {
  cookieHeader: string | null | undefined;
  userId: string;
  loggedIn: boolean;
  limits?: Partial<typeof DEFAULT_LIMITS>;
}): Promise<ReadingBackfillResult> {
  const limits = { ...DEFAULT_LIMITS, ...input.limits };

  if (!input.loggedIn) {
    return {
      ok: false,
      dailySynced: 0,
      threeCardSynced: 0,
      legacySynced: 0,
      failed: 0,
      remaining: { daily: 0, threeCard: 0, legacy: 0 },
    };
  }

  let dailySynced = 0;
  let threeCardSynced = 0;
  let failed = 0;

  const unsyncedDaily = await listUnsyncedDailyFortuneRecords(input.userId, limits.daily);
  for (const record of unsyncedDaily) {
    const before = record.readingSyncId;
    const synced = await maybeSyncDailyFortuneReading(
      input.cookieHeader,
      input.userId,
      record,
      true,
    );
    if (synced.readingSyncId && synced.readingSyncId !== before) {
      dailySynced += 1;
    } else if (!synced.readingSyncId) {
      failed += 1;
    }
  }

  const unsyncedThree = await listUnsyncedThreeCardReadings(input.userId, limits.threeCard);
  for (const record of unsyncedThree) {
    const before = record.readingSyncId;
    const synced = await maybeSyncThreeCardReading(
      input.cookieHeader,
      input.userId,
      record,
      true,
    );
    if (synced.readingSyncId && synced.readingSyncId !== before) {
      threeCardSynced += 1;
    } else if (!synced.readingSyncId) {
      failed += 1;
    }
  }

  const legacy = await backfillLegacyReadings(input.cookieHeader, input.userId, limits.legacy);
  failed += legacy.failed;

  const [remainingDaily, remainingThreeCard, legacyPending] = await Promise.all([
    prisma.dailyFortuneRecord.count({
      where: { userId: input.userId, readingSyncId: null, briefText: { not: null } },
    }),
    prisma.threeCardReading.count({
      where: { userId: input.userId, readingSyncId: null },
    }),
    hasLegacyBackfillDone(input.userId).then((done) => (done ? 0 : prisma.readingRecord.count({ where: { userId: input.userId } }))),
  ]);

  return {
    ok: true,
    dailySynced,
    threeCardSynced,
    legacySynced: legacy.synced,
    failed,
    remaining: {
      daily: remainingDaily,
      threeCard: remainingThreeCard,
      legacy: legacyPending,
    },
  };
}
