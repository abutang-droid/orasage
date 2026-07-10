import { createHash } from 'crypto';

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

export function buildInputHash(parts: Record<string, string>): string {
  const payload = Object.keys(parts)
    .sort()
    .map((key) => `${key}=${parts[key]}`)
    .join('\n');
  return createHash('sha256').update(payload).digest('hex').slice(0, 32);
}

export function hashToNumericSeed(hash: string): number {
  let n = 0;
  for (let i = 0; i < hash.length; i += 1) {
    n = ((n << 5) - n + hash.charCodeAt(i)) | 0;
  }
  return Math.abs(n) || 1;
}

export function buildThreeCardInputHash(
  userId: string,
  question: string,
  answers: StableAnswer[],
): string {
  return buildInputHash({
    flow: 'three-card',
    userId,
    question: normalizeQuestion(question) || '当下指引',
    answers: JSON.stringify(normalizeAnswers(answers)),
  });
}

export function buildDailyFortuneInputHash(
  userId: string,
  dateKey: string,
  answers: StableAnswer[],
): string {
  return buildInputHash({
    flow: 'daily-fortune',
    userId,
    dateKey,
    answers: JSON.stringify(normalizeAnswers(answers)),
  });
}

export function buildThreeCardQuestionContextHash(userId: string, question?: string | null): string {
  return buildInputHash({
    flow: 'three-card-questions',
    userId,
    question: normalizeQuestion(question) || '当下指引',
  });
}

export function buildDailyFortuneQuestionContextHash(userId: string, dateKey: string): string {
  return buildInputHash({
    flow: 'daily-fortune-questions',
    userId,
    dateKey,
  });
}
