import { prisma } from '@/lib/prisma';
import { drawCards } from '@/lib/tarot/draw';
import { hashToNumericSeed } from '@/lib/reading-stable';
import type {
  ThreeCardAnswer,
  ThreeCardBriefPayload,
  ThreeCardFullReport,
  ThreeCardRecordDto,
  ThreeCardStoredCard,
} from './types';

const POSITION_KEYS: Record<string, string> = {
  过去: 'past',
  现在: 'present',
  未来: 'future',
};

function parseBrief(raw: string | null): ThreeCardBriefPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ThreeCardBriefPayload;
  } catch {
    return { perCard: [], synthesis: raw, llm: false };
  }
}

function parseFullReport(raw: string | null): ThreeCardFullReport | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ThreeCardFullReport;
  } catch {
    return null;
  }
}

function mapRecord(row: {
  id: string;
  question: string;
  qaAnswers: unknown;
  cards: unknown;
  briefText: string | null;
  fullReport: string | null;
  paidTier: string | null;
  orderNo: string | null;
  readingSyncId: string | null;
  createdAt: Date;
}): ThreeCardRecordDto {
  return {
    id: row.id,
    question: row.question,
    qaAnswers: (row.qaAnswers as ThreeCardAnswer[] | null) ?? null,
    cards: (row.cards as ThreeCardStoredCard[]) ?? [],
    briefText: parseBrief(row.briefText),
    fullReport: parseFullReport(row.fullReport),
    paidTier: row.paidTier,
    orderNo: row.orderNo,
    readingSyncId: row.readingSyncId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function drawThreeCards(question: string, seedKey: string): ThreeCardStoredCard[] {
  const numericSeed = hashToNumericSeed(seedKey);
  const result = drawCards('three', question, numericSeed, 'afternoon');
  return result.cards.map((c) => ({
    position: POSITION_KEYS[c.position] ?? c.position,
    positionLabel: c.position,
    cardId: c.cardId,
    cardName: c.cardName,
    cardNameEn: c.card.nameEn,
    orientation: c.orientation,
    element: c.card.element,
  }));
}

export async function findThreeCardReadingByInputHash(userId: string, inputHash: string) {
  const row = await prisma.threeCardReading.findFirst({
    where: { userId, inputHash },
  });
  return row ? mapRecord(row) : null;
}

export async function createThreeCardReading(input: {
  userId: string;
  question: string;
  inputHash: string;
  qaAnswers: ThreeCardAnswer[];
  cards: ThreeCardStoredCard[];
}) {
  const row = await prisma.threeCardReading.create({
    data: {
      userId: input.userId,
      question: input.question.slice(0, 500),
      inputHash: input.inputHash,
      qaAnswers: input.qaAnswers,
      cards: input.cards,
    },
  });
  return mapRecord(row);
}

export async function getThreeCardReading(userId: string, id: string) {
  const row = await prisma.threeCardReading.findFirst({
    where: { id, userId },
  });
  return row ? mapRecord(row) : null;
}

export async function saveThreeCardBrief(id: string, userId: string, brief: ThreeCardBriefPayload) {
  const row = await prisma.threeCardReading.updateMany({
    where: { id, userId },
    data: { briefText: JSON.stringify(brief) },
  });
  return row.count > 0;
}

export async function saveThreeCardFullReport(
  id: string,
  userId: string,
  report: ThreeCardFullReport,
  paidTier: string,
  orderNo: string,
) {
  const row = await prisma.threeCardReading.updateMany({
    where: { id, userId },
    data: {
      fullReport: JSON.stringify(report),
      paidTier,
      orderNo,
    },
  });
  return row.count > 0;
}

export async function saveThreeCardReadingSyncId(id: string, userId: string, readingSyncId: string) {
  const row = await prisma.threeCardReading.updateMany({
    where: { id, userId },
    data: { readingSyncId },
  });
  return row.count > 0;
}

export async function listUnsyncedThreeCardReadings(userId: string, limit = 30) {
  const rows = await prisma.threeCardReading.findMany({
    where: {
      userId,
      readingSyncId: null,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map(mapRecord).filter((r) => r.cards.length > 0);
}

export async function countUnsyncedThreeCardReadings(userId: string) {
  return prisma.threeCardReading.count({
    where: {
      userId,
      readingSyncId: null,
    },
  });
}
