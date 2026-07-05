import {
  newReadingId,
  syncReading,
  WUXING_CRYSTAL_SKU,
  type ReadingSyncPayload,
} from '../../../shared/reading-sync/sync';
import type { DailyFortuneFullReport, DailyFortuneRecordDto } from './daily-fortune/types';
import type { ThreeCardFullReport, ThreeCardRecordDto } from './three-card/types';

export { newReadingId, syncReading, WUXING_CRYSTAL_SKU };
export type { ReadingSyncPayload };

type TarotCard = { cardName: string; orientation: '正位' | '逆位' };

export function syncTarotReading(
  cards: TarotCard[],
  options?: { synthesisText?: string; wuxing?: string; crystalName?: string; readingId?: string },
) {
  const cardLine = cards.map((c) => `${c.cardName}(${c.orientation})`).join(' · ');
  const wuxing = options?.wuxing;
  const crystalSku = wuxing ? WUXING_CRYSTAL_SKU[wuxing] : undefined;
  const reason = wuxing && options?.crystalName
    ? `根据本次牌阵能量，推荐 ${options.crystalName} 水晶`
    : undefined;
  const readingId = options?.readingId ?? newReadingId('tarot');

  return syncReading({
    appSource: 'tarot',
    readingId,
    title: '塔罗三牌阵',
    summary: options?.synthesisText?.slice(0, 500) || cardLine,
    recommendationReason: reason,
    crystalSku,
  });
}

export function buildDailyFortuneSyncPayload(
  record: Pick<
    DailyFortuneRecordDto,
    'id' | 'cardName' | 'orientation' | 'briefText' | 'fullReport' | 'dateKey'
  >,
  existingSyncId?: string | null,
): ReadingSyncPayload {
  const readingId = existingSyncId ?? newReadingId('tarot');
  const cardLabel = record.cardName
    ? `${record.cardName}（${record.orientation ?? '正位'}）`
    : '今日主牌';
  const payload: Record<string, unknown> = {
    type: 'daily_fortune',
    recordId: record.id,
    dateKey: record.dateKey,
    cardName: record.cardName,
    orientation: record.orientation,
    brief: record.briefText,
  };
  if (record.fullReport) {
    payload.fullReport = record.fullReport;
  }

  return {
    appSource: 'tarot',
    readingId,
    title: `每日运势 · ${cardLabel}`,
    summary: record.briefText?.slice(0, 500) ?? cardLabel,
    payloadJson: JSON.stringify(payload),
  };
}

export function buildThreeCardSyncPayload(
  record: Pick<
    ThreeCardRecordDto,
    'id' | 'question' | 'cards' | 'briefText' | 'fullReport' | 'paidTier'
  >,
  existingSyncId?: string | null,
): ReadingSyncPayload {
  const readingId = existingSyncId ?? newReadingId('tarot');
  const cardLine = record.cards
    .map((c) => `${c.positionLabel}:${c.cardName}(${c.orientation})`)
    .join(' · ');
  const questionLabel = record.question?.slice(0, 40) || '当下指引';
  const summary =
    record.fullReport?.synthesis?.slice(0, 500) ??
    record.briefText?.synthesis?.slice(0, 500) ??
    cardLine;

  const payload: Record<string, unknown> = {
    type: 'three_card',
    recordId: record.id,
    question: record.question,
    cards: record.cards,
    brief: record.briefText,
    paidTier: record.paidTier,
  };
  if (record.fullReport) {
    payload.fullReport = record.fullReport;
  }

  const title = record.paidTier
    ? `三牌阵详读 · ${questionLabel}`
    : `三牌阵 · ${questionLabel}`;

  return {
    appSource: 'tarot',
    readingId,
    title,
    summary,
    payloadJson: JSON.stringify(payload),
  };
}

export function syncDailyFortuneReading(
  record: Parameters<typeof buildDailyFortuneSyncPayload>[0],
  existingSyncId?: string | null,
) {
  return syncReading(buildDailyFortuneSyncPayload(record, existingSyncId));
}

export function syncThreeCardReading(
  record: Parameters<typeof buildThreeCardSyncPayload>[0],
  existingSyncId?: string | null,
) {
  return syncReading(buildThreeCardSyncPayload(record, existingSyncId));
}

export type { DailyFortuneFullReport };
