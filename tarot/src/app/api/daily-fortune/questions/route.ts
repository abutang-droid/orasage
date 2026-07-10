import { NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { generateDailyFortuneQuestions } from '@/lib/daily-fortune/questions';
import { prisma } from '@/lib/prisma';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

export async function POST(req: Request) {
  const ensured = await ensureAuthUser();
  const language = resolveAiLocaleFromRequest({ headers: req.headers, url: req.url });
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

  const res = NextResponse.json(result);
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
