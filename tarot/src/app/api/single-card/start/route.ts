import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isDestinySliceUnlocked, tryUnlockFromOrder } from '@/lib/single-card-unlock';
import { createSingleCardReading, drawSingleCard } from '@/lib/single-card/record';
import { normalizeQuestion } from '@/lib/reading-stable';

const bodySchema = z.object({
  question: z.string().trim().min(4, '请写下你面临的抉择（至少 4 个字）').max(500),
  pickIndex: z.number().int().min(0).max(20).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());
    const question = normalizeQuestion(body.question);
    if (!question || question.length < 4) {
      return NextResponse.json({ error: '请写下你面临的抉择（至少 4 个字）' }, { status: 400 });
    }

    const unlocked = await isDestinySliceUnlocked(ensured.userId);
    if (!unlocked) {
      const res = NextResponse.json(
        { ok: false, error: 'unlock_required', unlocked: false },
        { status: 402 },
      );
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const seedSuffix = body.pickIndex != null ? `:pick${body.pickIndex}` : '';
    const card = drawSingleCard(`${question}${seedSuffix}`);
    const record = await createSingleCardReading({
      userId: ensured.userId,
      question,
      card,
    });

    const res = NextResponse.json({
      ok: true,
      readingId: record.id,
      card: record.card,
      question: record.question,
      unlocked: true,
    });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const msg = err.issues[0]?.message ?? '参数错误';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error('[single-card/start]', err);
    return NextResponse.json({ error: '抽牌失败' }, { status: 500 });
  }
}
