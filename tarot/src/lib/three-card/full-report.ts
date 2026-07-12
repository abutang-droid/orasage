import type { AiLocale } from '../../../../shared/ai-locale/index';
import { generateThreeCardTrilogyFromLayers } from '@/lib/tarot/generation/generate';
import type { ThreeCardAnswer, ThreeCardFullReport, ThreeCardStoredCard } from './types';

export async function generateThreeCardFullReport(input: {
  question: string;
  cards: ThreeCardStoredCard[];
  answers: ThreeCardAnswer[];
  language?: AiLocale;
}): Promise<ThreeCardFullReport> {
  const { question, cards, answers, language = 'zh-CN' } = input;
  return generateThreeCardTrilogyFromLayers({
    question,
    answers: answers.map((a) => ({
      questionId: a.questionId,
      question: a.question,
      answer: a.answer,
    })),
    cards: cards.map((c) => ({
      cardId: c.cardId,
      cardName: c.cardName,
      cardNameEn: c.cardNameEn,
      orientation: c.orientation,
      element: c.element,
      position: c.position,
      positionLabel: c.positionLabel,
    })),
    spreadType: 'three-card',
    language,
  });
}
