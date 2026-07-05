import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { canStartThreeCardBrief } from '@/lib/three-card-access';
import { createThreeCardReading, drawThreeCards } from '@/lib/three-card/record';
import type { ThreeCardAnswer } from '@/lib/three-card/types';

const bodySchema = z.object({
  question: z.string().max(500).optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        question: z.string().min(1),
        answer: z.string().min(1).max(200),
      }),
    )
    .min(1)
    .max(8),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const access = canStartThreeCardBrief();
    if (!access.ok) {
      return NextResponse.json({ error: '无法开始' }, { status: 403 });
    }

    const body = bodySchema.parse(await req.json());
    const question = (body.question ?? '').trim();
    const cards = drawThreeCards(question);
    const answers = body.answers as ThreeCardAnswer[];

    const record = await createThreeCardReading({
      userId: ensured.userId,
      question: question || '当下指引',
      qaAnswers: answers,
      cards,
    });

    const res = NextResponse.json({
      ok: true,
      readingId: record.id,
      cards: record.cards,
      question: record.question,
    });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '请完整回答引导问题' }, { status: 400 });
    }
    console.error('[three-card/start]', err);
    return NextResponse.json({ error: '抽牌失败' }, { status: 500 });
  }
}
