import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { DESTINY_SLICE_SILENT_QUESTION } from '@/lib/single-card/constants';
import { createSingleCardReading, drawSingleCard } from '@/lib/single-card/record';

const bodySchema = z.object({
  pickIndex: z.number().int().min(0).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());

    const drawSeed = `${ensured.userId}:${Date.now()}:pick${body.pickIndex}`;
    const card = drawSingleCard(drawSeed);
    const record = await createSingleCardReading({
      userId: ensured.userId,
      question: DESTINY_SLICE_SILENT_QUESTION,
      card,
    });

    const res = NextResponse.json({
      ok: true,
      readingId: record.id,
      card: record.card,
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
