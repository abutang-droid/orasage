import { buildTarotAccountRecommendSeed } from '../../../shared/recommend-seed/index';

export type StableAnswer = {
  questionId: string;
  question: string;
  answer: string;
};

export function normalizeQuestion(question?: string | null): string {
  return (question ?? '').trim().slice(0, 500);
}

export function normalizeAnswers(answers: StableAnswer[]): StableAnswer[] {
  return [...answers]
    .map((a) => ({
      questionId: a.questionId.trim(),
      question: a.question.trim(),
      answer: a.answer.trim(),
    }))
    .sort((a, b) => a.questionId.localeCompare(b.questionId));
}

export function buildDailyFortuneDrawSeed(userId: string, dateKey: string): string {
  return `${userId}:${dateKey}`;
}

export function buildDailyFortuneQuestionContextHash(userId: string, dateKey: string): string {
  return `${userId}:${dateKey}:questions`;
}

export { buildTarotAccountRecommendSeed };
