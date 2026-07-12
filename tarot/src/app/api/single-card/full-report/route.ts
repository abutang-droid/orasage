import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { generateSingleCardFullReport } from '@/lib/single-card/full-report';
import { getSingleCardReading, saveSingleCardFullReport } from '@/lib/single-card/record';
import { isSingleCardVerdict } from '@/lib/single-card/types';
import { maybeSyncSingleCardReading } from '@/lib/single-card/sync';
import { resolveSingleCardReportAccess } from '@/lib/single-card-access';
import { prisma } from '@/lib/prisma';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

const bodySchema = z.object({
  readingId: z.string().uuid(),
  orderNo: z.string().optional(),
  useTempleFree: z.boolean().optional(),
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
    if (!loggedIn) {
      const res = NextResponse.json({ ok: false, error: 'login_required' }, { status: 401 });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const record = await getSingleCardReading(ensured.userId, body.readingId);
    if (!record) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    if (record.fullReport && record.paidTier) {
      const synced = await maybeSyncSingleCardReading(
        req.headers.get('cookie'),
        ensured.userId,
        record,
        loggedIn,
      );
      const res = NextResponse.json({
        ok: true,
        fullReport: synced.fullReport,
        tier: synced.paidTier,
        orderNo: synced.orderNo,
        readingSyncId: synced.readingSyncId,
      });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const orderNo = body.orderNo?.trim() || record.orderNo || null;
    const access = await resolveSingleCardReportAccess(ensured.userId, orderNo, {
      useTempleFree: body.useTempleFree === true,
    });
    if (!access.ok) {
      const res = NextResponse.json(
        {
          ok: false,
          error: 'paywall',
          skus: access.skus,
          templeFreeAvailable: access.templeFreeAvailable,
        },
        { status: 402 },
      );
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const literalMeaning = record.briefText
      ? isSingleCardVerdict(record.briefText)
        ? record.briefText.explanation
        : record.briefText.text
      : undefined;

    const fullReport = await generateSingleCardFullReport({
      question: record.question,
      qaAnswers: record.qaAnswers ?? [],
      card: record.card,
      literalMeaning,
      language,
    });

    await saveSingleCardFullReport(
      record.id,
      ensured.userId,
      fullReport,
      access.tier,
      access.orderNo,
    );

    const updated = await getSingleCardReading(ensured.userId, body.readingId);
    const synced = updated
      ? await maybeSyncSingleCardReading(
          req.headers.get('cookie'),
          ensured.userId,
          {
            ...updated,
            fullReport,
            paidTier: access.tier,
            orderNo: access.orderNo,
          },
          loggedIn,
        )
      : null;

    const res = NextResponse.json({
      ok: true,
      fullReport,
      tier: access.tier,
      orderNo: access.orderNo,
      readingSyncId: synced?.readingSyncId ?? null,
    });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[single-card/full-report]', err);
    return NextResponse.json({ error: '详读生成失败' }, { status: 500 });
  }
}
