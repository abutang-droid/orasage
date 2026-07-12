import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { generateDestinySliceGuidance } from '@/lib/single-card/guidance';
import { getSingleCardReading, saveSingleCardBrief } from '@/lib/single-card/record';
import { maybeSyncSingleCardReading } from '@/lib/single-card/sync';
import { prisma } from '@/lib/prisma';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

const bodySchema = z.object({
  readingId: z.string().uuid(),
  language: z.string().optional(),
  locale: z.string().optional(),
  lang: z.string().optional(),
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

    const record = await getSingleCardReading(ensured.userId, body.readingId);
    if (!record) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    if (record.briefText) {
      const synced = await maybeSyncSingleCardReading(
        req.headers.get('cookie'),
        ensured.userId,
        record,
        loggedIn,
      );
      const res = NextResponse.json({ ok: true, brief: synced.briefText });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const brief = await generateDestinySliceGuidance({
      question: record.question,
      card: record.card,
      language,
    });

    await saveSingleCardBrief(record.id, ensured.userId, brief);

    const updated = await getSingleCardReading(ensured.userId, body.readingId);
    const synced = updated
      ? await maybeSyncSingleCardReading(
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
    console.error('[single-card/brief]', err);
    return NextResponse.json({ error: '指引生成失败' }, { status: 500 });
  }
}
