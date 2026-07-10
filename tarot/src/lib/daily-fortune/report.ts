import type { AiLocale } from '../../../../shared/ai-locale/index';
import { generateDailyFortuneFromLayers } from '@/lib/tarot/generation/generate';
import type { TarotCardData } from '@/lib/tarot/cards';
import type { DailyFortuneAnswer, DailyFortuneReportPayload } from './types';

export async function generateDailyFortuneReport(input: {
  card: TarotCardData;
  orientation: '正位' | '逆位';
  answers: DailyFortuneAnswer[];
  nickname?: string | null;
  language?: AiLocale;
}): Promise<DailyFortuneReportPayload> {
  const { card, orientation, answers, nickname, language = 'zh-CN' } = input;
  return generateDailyFortuneFromLayers({
    question: '今日运势',
    answers: answers.map((a) => ({
      questionId: a.questionId,
      question: a.question,
      answer: a.answer,
    })),
    nickname,
    language,
    cards: [{
      cardId: card.id,
      cardName: card.name,
      cardNameEn: card.nameEn,
      orientation,
      element: card.element,
    }],
    spreadType: 'daily-fortune',
  });
}
