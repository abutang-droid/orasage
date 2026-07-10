import { prisma } from '@/lib/prisma';
import { drawCards } from '@/lib/tarot/draw';
import type {
  SingleCardBriefPayload,
  SingleCardFullReport,
  SingleCardRecordDto,
  SingleCardStoredCard,
} from './types';

function parseBrief(raw: string | null): SingleCardBriefPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SingleCardBriefPayload;
  } catch {
    return { text: raw, llm: false };
  }
}

function parseFullReport(raw: string | null): SingleCardFullReport | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SingleCardFullReport;
  } catch {
    return null;
  }
}

function mapRecord(row: {
  id: string;
  question: string;
  cardId: number;
  cardName: string;
  cardNameEn: string | null;
  orientation: string;
  element: string | null;
  briefText: string | null;
  fullReport: string | null;
  paidTier: string | null;
  orderNo: string | null;
  readingSyncId: string | null;
  createdAt: Date;
}): SingleCardRecordDto {
  return {
    id: row.id,
    question: row.question,
    card: {
      cardId: row.cardId,
      cardName: row.cardName,
      cardNameEn: row.cardNameEn ?? '',
      orientation: row.orientation as '正位' | '逆位',
      element: row.element ?? '',
    },
    briefText: parseBrief(row.briefText),
    fullReport: parseFullReport(row.fullReport),
    paidTier: row.paidTier,
    orderNo: row.orderNo,
    readingSyncId: row.readingSyncId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function drawSingleCard(question: string): SingleCardStoredCard {
  const result = drawCards('single', question);
  const c = result.cards[0];
  if (!c) throw new Error('单牌阵抽牌失败');
  return {
    cardId: c.cardId,
    cardName: c.cardName,
    cardNameEn: c.card.nameEn,
    orientation: c.orientation,
    element: c.card.element,
  };
}

export async function createSingleCardReading(input: {
  userId: string;
  question: string;
  card: SingleCardStoredCard;
}) {
  const row = await prisma.singleCardReading.create({
    data: {
      userId: input.userId,
      question: input.question.slice(0, 500),
      cardId: input.card.cardId,
      cardName: input.card.cardName,
      cardNameEn: input.card.cardNameEn,
      orientation: input.card.orientation,
      element: input.card.element,
    },
  });
  return mapRecord(row);
}

export async function getSingleCardReading(userId: string, id: string) {
  const row = await prisma.singleCardReading.findFirst({
    where: { id, userId },
  });
  return row ? mapRecord(row) : null;
}

export async function saveSingleCardBrief(id: string, userId: string, brief: SingleCardBriefPayload) {
  const row = await prisma.singleCardReading.updateMany({
    where: { id, userId },
    data: { briefText: JSON.stringify(brief) },
  });
  return row.count > 0;
}

export async function saveSingleCardFullReport(
  id: string,
  userId: string,
  report: SingleCardFullReport,
  paidTier: string,
  orderNo: string,
) {
  const row = await prisma.singleCardReading.updateMany({
    where: { id, userId },
    data: {
      fullReport: JSON.stringify(report),
      paidTier,
      orderNo,
    },
  });
  return row.count > 0;
}

export async function saveSingleCardReadingSyncId(id: string, userId: string, readingSyncId: string) {
  const row = await prisma.singleCardReading.updateMany({
    where: { id, userId },
    data: { readingSyncId },
  });
  return row.count > 0;
}

export async function listUnsyncedSingleCardReadings(userId: string, limit = 30) {
  const rows = await prisma.singleCardReading.findMany({
    where: {
      userId,
      readingSyncId: null,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map(mapRecord);
}
