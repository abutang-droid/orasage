import { newReadingId, syncReading, WUXING_CRYSTAL_SKU } from '../../../shared/reading-sync/sync';

export { newReadingId, syncReading, WUXING_CRYSTAL_SKU };

type TarotCard = { cardName: string; orientation: '正位' | '逆位' };

export function syncTarotReading(
  cards: TarotCard[],
  options?: { synthesisText?: string; wuxing?: string; crystalName?: string },
) {
  const cardLine = cards.map((c) => `${c.cardName}(${c.orientation})`).join(' · ');
  const wuxing = options?.wuxing;
  const crystalSku = wuxing ? WUXING_CRYSTAL_SKU[wuxing] : undefined;
  const reason = wuxing && options?.crystalName
    ? `根据本次牌阵能量，推荐 ${options.crystalName} 水晶`
    : undefined;

  return syncReading({
    appSource: 'tarot',
    readingId: newReadingId('tarot'),
    title: '塔罗三牌阵',
    summary: options?.synthesisText?.slice(0, 500) || cardLine,
    recommendationReason: reason,
    crystalSku,
  });
}
