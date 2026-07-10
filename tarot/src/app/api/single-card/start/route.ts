import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { consumeSingleCardDraw, getSingleCardQuota } from '@/lib/single-card-quota';
import { createSingleCardReading, drawSingleCard } from '@/lib/single-card/record';
import { normalizeQuestion } from '@/lib/reading-stable';

const bodySchema = z.object({
  question: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());
    const question = normalizeQuestion(body.question) || '当下指引';

    const access = await consumeSingleCardDraw(ensured.userId);
    if (!access.ok) {
      const quota = await getSingleCardQuota(ensured.userId);
      const res = NextResponse.json(
        { ok: false, error: 'quota_exhausted', quota, remaining: 0 },
        { status: 402 },
      );
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const card = drawSingleCard(question);
    const record = await createSingleCardReading({
      userId: ensured.userId,
      question,
      card,
    });

    const quota = await getSingleCardQuota(ensured.userId);

    const res = NextResponse.json({
      ok: true,
      readingId: record.id,
      card: record.card,
      question: record.question,
      quota,
      remaining: access.remaining,
      source: access.source,
    });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[single-card/start]', err);
    return NextResponse.json({ error: '抽牌失败' }, { status: 500 });
  }
}
