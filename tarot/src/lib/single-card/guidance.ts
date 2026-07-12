import type { AiLocale } from '../../../../shared/ai-locale/index';
import { generateDestinySliceGuidanceFromLayers } from '@/lib/tarot/generation/generate';
import type { DestinySliceGuidancePayload, SingleCardStoredCard } from './types';

/** 定命切片：抽牌后生成简洁行动指引 */
export async function generateDestinySliceGuidance(input: {
  question: string;
  card: SingleCardStoredCard;
  language?: AiLocale;
}): Promise<DestinySliceGuidancePayload> {
  const { question, card, language = 'zh-CN' } = input;
  return generateDestinySliceGuidanceFromLayers({
    question,
    cards: [{
      cardId: card.cardId,
      cardName: card.cardName,
      cardNameEn: card.cardNameEn,
      orientation: card.orientation,
      element: card.element,
    }],
    language,
  });
}
