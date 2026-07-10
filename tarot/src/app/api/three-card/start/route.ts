import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { canStartThreeCardBrief } from '@/lib/three-card-access';
import {
  createThreeCardReading,
  drawThreeCards,
  findThreeCardReadingByInputHash,
} from '@/lib/three-card/record';
import type { ThreeCardAnswer } from '@/lib/three-card/types';
import { buildThreeCardInputHash, normalizeQuestion } from '@/lib/reading-stable';

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
    const question = normalizeQuestion(body.question) || '当下指引';
    const answers = body.answers as ThreeCardAnswer[];
    const inputHash = buildThreeCardInputHash(ensured.userId, question, answers);

    const existing = await findThreeCardReadingByInputHash(ensured.userId, inputHash);
    if (existing) {
      const res = NextResponse.json({
        ok: true,
        readingId: existing.id,
        cards: existing.cards,
        question: existing.question,
        cached: true,
      });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const cards = drawThreeCards(question, inputHash);

    try {
      const record = await createThreeCardReading({
        userId: ensured.userId,
        question,
        inputHash,
        qaAnswers: answers,
        cards,
      });

      const res = NextResponse.json({
        ok: true,
        readingId: record.id,
        cards: record.cards,
        question: record.question,
        cached: false,
      });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const raced = await findThreeCardReadingByInputHash(ensured.userId, inputHash);
        if (raced) {
          const res = NextResponse.json({
            ok: true,
            readingId: raced.id,
            cards: raced.cards,
            question: raced.question,
            cached: true,
          });
          if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
          return res;
        }
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '请完整回答引导问题' }, { status: 400 });
    }
    console.error('[three-card/start]', err);
    return NextResponse.json({ error: '抽牌失败' }, { status: 500 });
  }
}
