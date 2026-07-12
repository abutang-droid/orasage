import type { AiLocale } from '../../../../shared/ai-locale/index';
import { generateLiteralMeaningFromLayers } from '@/lib/tarot/generation/generate';
import type { ThreeCardBriefPayload, ThreeCardStoredCard } from './types';

/** 免费简读：仅输出各牌位字面释义 */
export async function generateThreeCardBrief(input: {
  question: string;
  cards: ThreeCardStoredCard[];
  language?: AiLocale;
}): Promise<ThreeCardBriefPayload> {
  const { cards, language = 'zh-CN' } = input;
  const results = await Promise.all(
    cards.map(async (c) => {
      const literal = await generateLiteralMeaningFromLayers({
        cardId: c.cardId,
        cardName: c.cardName,
        cardNameEn: c.cardNameEn,
        orientation: c.orientation,
        language,
      });
      return {
        position: c.positionLabel,
        text: literal.text,
        llm: literal.llm,
      };
    }),
  );

  return {
    perCard: results.map(({ position, text }) => ({ position, text })),
    synthesis: '',
    literal: true,
    llm: results.some((r) => r.llm),
  };
}
