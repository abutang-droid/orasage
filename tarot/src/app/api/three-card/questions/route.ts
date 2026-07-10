import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { generateThreeCardQuestions } from '@/lib/three-card/questions';
import { prisma } from '@/lib/prisma';
import { getCachedQuestions, saveCachedQuestions } from '@/lib/reading-question-cache';
import { buildThreeCardQuestionContextHash } from '@/lib/reading-stable';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

const bodySchema = z.object({
  question: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const ensured = await ensureAuthUser();
  const body = bodySchema.parse(await req.json().catch(() => ({})));
  const language = resolveAiLocaleFromRequest(req, body);
  const contextHash = buildThreeCardQuestionContextHash(ensured.userId, body.question);

  const cached = await getCachedQuestions(ensured.userId, 'three-card', contextHash);
  if (cached) {
    const res = NextResponse.json({ questions: cached.questions, llm: cached.llm, cached: true });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  }

  const user = await prisma.user.findUnique({
    where: { id: ensured.userId },
    select: { nickname: true, gender: true, occupation: true, faith: true },
  });

  const result = await generateThreeCardQuestions({
    question: body.question ?? '',
    nickname: user?.nickname,
    gender: user?.gender,
    occupation: user?.occupation,
    faith: user?.faith,
    language,
  });

  await saveCachedQuestions(
    ensured.userId,
    'three-card',
    contextHash,
    result.questions,
    result.llm,
  );

  const res = NextResponse.json({ ...result, cached: false });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
