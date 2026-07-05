import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { generateThreeCardQuestions } from '@/lib/three-card/questions';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  question: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const ensured = await ensureAuthUser();
  const body = bodySchema.parse(await req.json().catch(() => ({})));

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
  });

  const res = NextResponse.json(result);
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
