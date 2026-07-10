import {
  interpretReadingWithLlm,
  type ReadingCardInput,
} from '@/lib/llm/reading-interpret';
import type { AiLocale } from '../../../../shared/ai-locale/index';
import type { SingleCardFullReport, SingleCardStoredCard } from './types';

export async function generateSingleCardFullReport(input: {
  question: string;
  card: SingleCardStoredCard;
  language?: AiLocale;
}): Promise<SingleCardFullReport> {
  const cardInputs: ReadingCardInput[] = [
    {
      position: 'current',
      positionLabel: '当前指引',
      cardName: input.card.cardName,
      cardNameEn: input.card.cardNameEn,
      cardId: input.card.cardId,
      orientation: input.card.orientation,
      element: input.card.element,
    },
  ];

  const result = await interpretReadingWithLlm({
    question: input.question || '当下指引',
    spreadType: '单牌阵',
    cards: cardInputs,
    language: input.language ?? 'zh-CN',
  });

  return {
    cards: result.cards,
    synthesis: result.synthesis,
    suggestions: result.suggestions,
    affirmation: result.affirmation,
    llm: result.llm,
  };
}
