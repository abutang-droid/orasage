import { prisma } from '@/lib/prisma';
import { drawCards } from '@/lib/tarot/draw';
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
    createdAt: row.createdAt.toISOString(),
  };
}

export function drawThreeCards(question: string): ThreeCardStoredCard[] {
  const result = drawCards('three', question);
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

export async function createThreeCardReading(input: {
  userId: string;
  question: string;
  qaAnswers: ThreeCardAnswer[];
  cards: ThreeCardStoredCard[];
}) {
  const row = await prisma.threeCardReading.create({
    data: {
      userId: input.userId,
      question: input.question.slice(0, 500),
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
