import type { AiLocale } from '../../../../shared/ai-locale/index';
import { generateSingleCardVerdictFromLayers } from '@/lib/tarot/generation/generate';
import type { SingleCardStoredCard, SingleCardVerdictPayload } from './types';

/** 抽牌后生成是/否启示结论 */
export async function generateSingleCardVerdict(input: {
  question: string;
  card: SingleCardStoredCard;
  language?: AiLocale;
}): Promise<SingleCardVerdictPayload> {
  const { question, card, language = 'zh-CN' } = input;
  return generateSingleCardVerdictFromLayers({
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
