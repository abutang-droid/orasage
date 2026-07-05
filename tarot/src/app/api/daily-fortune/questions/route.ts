import { NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { generateDailyFortuneQuestions } from '@/lib/daily-fortune/questions';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const ensured = await ensureAuthUser();
  const user = await prisma.user.findUnique({
    where: { id: ensured.userId },
    select: { nickname: true, gender: true, occupation: true, faith: true },
  });

  const result = await generateDailyFortuneQuestions({
    nickname: user?.nickname,
    gender: user?.gender,
    occupation: user?.occupation,
    faith: user?.faith,
  });

  const res = NextResponse.json(result);
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
