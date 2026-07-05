import {
  interpretReadingWithLlm,
  type ReadingCardInput,
} from '@/lib/llm/reading-interpret';
import type { ThreeCardAnswer, ThreeCardFullReport, ThreeCardStoredCard } from './types';

export async function generateThreeCardFullReport(input: {
  question: string;
  cards: ThreeCardStoredCard[];
  answers: ThreeCardAnswer[];
}): Promise<ThreeCardFullReport> {
  const cardInputs: ReadingCardInput[] = input.cards.map((c) => ({
    position: c.position,
    positionLabel: c.positionLabel,
    cardName: c.cardName,
    cardNameEn: c.cardNameEn,
    cardId: c.cardId,
    orientation: c.orientation,
    element: c.element,
  }));

  const result = await interpretReadingWithLlm({
    question: input.question || '当下指引',
    spreadType: '三牌阵（过去·现在·未来）',
    cards: cardInputs,
  });

  return {
    cards: result.cards,
    synthesis: result.synthesis,
    suggestions: result.suggestions,
    affirmation: result.affirmation,
    llm: result.llm,
  };
}
