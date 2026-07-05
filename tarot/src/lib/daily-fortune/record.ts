import { dateKeyUTC } from '@/lib/merit';
import { prisma } from '@/lib/prisma';
import { ALL_CARDS } from '@/lib/tarot/cards';
import type { DailyFortuneAnswer, DailyFortuneFullReport, DailyFortuneRecordDto } from './types';

export function drawDailyFortuneCard(seed: string): {
  card: (typeof ALL_CARDS)[number];
  orientation: '正位' | '逆位';
} {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % ALL_CARDS.length;
  const orientation = Math.abs(hash) % 2 === 0 ? '正位' : '逆位';
  return { card: ALL_CARDS[idx], orientation };
}

function mapRecord(row: {
  id: string;
  dateKey: string;
  cardId: number | null;
  cardName: string | null;
  orientation: string | null;
  qaAnswers: unknown;
  briefText: string | null;
  fullReport: unknown;
  accessSource: string;
  readingSyncId: string | null;
  createdAt: Date;
}): DailyFortuneRecordDto {
  return {
    id: row.id,
    dateKey: row.dateKey,
    cardId: row.cardId,
    cardName: row.cardName,
    orientation: row.orientation,
    qaAnswers: (row.qaAnswers as DailyFortuneAnswer[] | null) ?? null,
    briefText: row.briefText,
    fullReport: (row.fullReport as DailyFortuneFullReport | null) ?? null,
    accessSource: row.accessSource,
    readingSyncId: row.readingSyncId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listTodayDailyFortuneRecords(userId: string, dateKey = dateKeyUTC()) {
  const rows = await prisma.dailyFortuneRecord.findMany({
    where: { userId, dateKey },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapRecord);
}

export async function getDailyFortuneRecordById(userId: string, id: string) {
  const row = await prisma.dailyFortuneRecord.findFirst({
    where: { id, userId },
  });
  return row ? mapRecord(row) : null;
}

export async function createDailyFortuneRecord(input: {
  userId: string;
  dateKey?: string;
  cardId: number;
  cardName: string;
  orientation: '正位' | '逆位';
  qaAnswers: DailyFortuneAnswer[];
  briefText: string;
  fullReport: DailyFortuneFullReport;
  accessSource: string;
  orderNo?: string | null;
}) {
  const row = await prisma.dailyFortuneRecord.create({
    data: {
      userId: input.userId,
      dateKey: input.dateKey ?? dateKeyUTC(),
      cardId: input.cardId,
      cardName: input.cardName,
      orientation: input.orientation,
      qaAnswers: input.qaAnswers,
      briefText: input.briefText,
      fullReport: input.fullReport,
      accessSource: input.accessSource,
      orderNo: input.orderNo ?? null,
    },
  });
  return mapRecord(row);
}

export async function saveDailyFortuneReadingSyncId(id: string, userId: string, readingSyncId: string) {
  const row = await prisma.dailyFortuneRecord.updateMany({
    where: { id, userId },
    data: { readingSyncId },
  });
  return row.count > 0;
}
