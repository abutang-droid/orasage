import type { AiLocale } from '../../../../shared/ai-locale/index';
import { generateSpreadFullFromLayers } from '@/lib/tarot/generation/generate';

export type ReadingCardInput = {
  position: string;
  positionLabel: string;
  cardName: string;
  cardNameEn?: string;
  cardId: number;
  orientation: '正位' | '逆位';
  element: string;
};

export type ReadingInterpretResult = {
  cards: Array<{ interpretation: string; mantra: string }>;
  synthesis: string;
  suggestions: string[];
  affirmation: string;
  llm: boolean;
};

export async function interpretReadingWithLlm(input: {
  question: string;
  spreadType: string;
  cards: ReadingCardInput[];
  language?: AiLocale;
}): Promise<ReadingInterpretResult> {
  const { question, spreadType, cards, language = 'zh-CN' } = input;
  return generateSpreadFullFromLayers({
    question,
    spreadType,
    language,
    cards: cards.map((c) => ({
      cardId: c.cardId,
      cardName: c.cardName,
      cardNameEn: c.cardNameEn,
      orientation: c.orientation,
      element: c.element,
      position: c.position,
      positionLabel: c.positionLabel,
    })),
  });
}
