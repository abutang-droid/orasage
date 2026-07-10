import { NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { generateDailyFortuneQuestions } from '@/lib/daily-fortune/questions';
import { getDailyFortuneQuota } from '@/lib/daily-fortune-quota';
import { prisma } from '@/lib/prisma';
import { getCachedQuestions, saveCachedQuestions } from '@/lib/reading-question-cache';
import { buildDailyFortuneQuestionContextHash } from '@/lib/reading-stable';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

export async function POST(req: Request) {
  const ensured = await ensureAuthUser();
  const language = resolveAiLocaleFromRequest({ headers: req.headers, url: req.url });
  const quota = await getDailyFortuneQuota(ensured.userId);
  const contextHash = buildDailyFortuneQuestionContextHash(ensured.userId, quota.dateKey);

  const cached = await getCachedQuestions(ensured.userId, 'daily-fortune', contextHash);
  if (cached) {
    const res = NextResponse.json({ questions: cached.questions, llm: cached.llm, cached: true });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  }

  const user = await prisma.user.findUnique({
    where: { id: ensured.userId },
    select: { nickname: true, gender: true, occupation: true, faith: true },
  });

  const result = await generateDailyFortuneQuestions({
    nickname: user?.nickname,
    gender: user?.gender,
    occupation: user?.occupation,
    faith: user?.faith,
    language,
  });

  await saveCachedQuestions(
    ensured.userId,
    'daily-fortune',
    contextHash,
    result.questions,
    result.llm,
  );

  const res = NextResponse.json({ ...result, cached: false });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
