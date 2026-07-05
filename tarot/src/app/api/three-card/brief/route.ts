import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { generateThreeCardBrief } from '@/lib/three-card/brief';
import { getThreeCardReading, saveThreeCardBrief } from '@/lib/three-card/record';
import type { ThreeCardAnswer } from '@/lib/three-card/types';

const bodySchema = z.object({
  readingId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());

    const record = await getThreeCardReading(ensured.userId, body.readingId);
    if (!record) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    if (record.briefText) {
      const res = NextResponse.json({ ok: true, brief: record.briefText });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const brief = await generateThreeCardBrief({
      question: record.question,
      cards: record.cards,
      answers: (record.qaAnswers ?? []) as ThreeCardAnswer[],
    });

    await saveThreeCardBrief(record.id, ensured.userId, brief);

    const res = NextResponse.json({ ok: true, brief });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[three-card/brief]', err);
    return NextResponse.json({ error: '简读生成失败' }, { status: 500 });
  }
}
