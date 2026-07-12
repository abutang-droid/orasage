import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { generateThreeCardBrief } from '@/lib/three-card/brief';
import { getThreeCardReading, saveThreeCardBrief } from '@/lib/three-card/record';
import { maybeSyncThreeCardReading } from '@/lib/three-card/sync';
import type { ThreeCardAnswer } from '@/lib/three-card/types';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { prisma } from '@/lib/prisma';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

const bodySchema = z.object({
  readingId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());
    const language = resolveAiLocaleFromRequest(req, body);
    const user = await prisma.user.findUnique({
      where: { id: ensured.userId },
      select: { email: true },
    });
    const loggedIn = await isOrasageLoggedIn(user?.email);

    const record = await getThreeCardReading(ensured.userId, body.readingId);
    if (!record) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    if (record.briefText) {
      const synced = await maybeSyncThreeCardReading(
        req.headers.get('cookie'),
        ensured.userId,
        record,
        loggedIn,
      );
      const res = NextResponse.json({ ok: true, brief: synced.briefText });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const brief = await generateThreeCardBrief({
      question: record.question,
      cards: record.cards,
      language,
    });

    await saveThreeCardBrief(record.id, ensured.userId, brief);

    const updated = await getThreeCardReading(ensured.userId, body.readingId);
    const synced = updated
      ? await maybeSyncThreeCardReading(
          req.headers.get('cookie'),
          ensured.userId,
          { ...updated, briefText: brief },
          loggedIn,
        )
      : null;

    const res = NextResponse.json({ ok: true, brief, readingSyncId: synced?.readingSyncId ?? null });
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
