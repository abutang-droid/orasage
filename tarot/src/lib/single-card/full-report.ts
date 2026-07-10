import type { AiLocale } from '../../../../shared/ai-locale/index';
import { generateSingleCardFullFromLayers } from '@/lib/tarot/generation/generate';
import type { SingleCardAnswer, SingleCardFullReport, SingleCardStoredCard } from './types';

export async function generateSingleCardFullReport(input: {
  question: string;
  qaAnswers?: SingleCardAnswer[];
  card: SingleCardStoredCard;
  literalMeaning?: string;
  language?: AiLocale;
}): Promise<SingleCardFullReport> {
  const { question, qaAnswers = [], card, language = 'zh-CN' } = input;
  return generateSingleCardFullFromLayers({
    question,
    answers: qaAnswers.map((a) => ({
      questionId: a.questionId,
      question: a.question,
      answer: a.answer,
    })),
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
