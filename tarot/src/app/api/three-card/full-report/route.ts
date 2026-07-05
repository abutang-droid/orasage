import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { generateThreeCardFullReport } from '@/lib/three-card/full-report';
import { getThreeCardReading, saveThreeCardFullReport } from '@/lib/three-card/record';
import type { ThreeCardAnswer } from '@/lib/three-card/types';
import { resolveThreeCardReportAccess } from '@/lib/three-card-access';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  readingId: z.string().uuid(),
  orderNo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());

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

    const record = await getThreeCardReading(ensured.userId, body.readingId);
    if (!record) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    if (record.fullReport && record.paidTier) {
      const res = NextResponse.json({
        ok: true,
        fullReport: record.fullReport,
        tier: record.paidTier,
        orderNo: record.orderNo,
      });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const orderNo = body.orderNo?.trim() || record.orderNo || null;
    const access = await resolveThreeCardReportAccess(ensured.userId, orderNo);
    if (!access.ok) {
      const res = NextResponse.json(
        { ok: false, error: 'paywall', skus: access.skus },
        { status: 402 },
      );
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const fullReport = await generateThreeCardFullReport({
      question: record.question,
      cards: record.cards,
      answers: (record.qaAnswers ?? []) as ThreeCardAnswer[],
    });

    await saveThreeCardFullReport(
      record.id,
      ensured.userId,
      fullReport,
      access.tier,
      access.orderNo,
    );

    const res = NextResponse.json({
      ok: true,
      fullReport,
      tier: access.tier,
      orderNo: access.orderNo,
    });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[three-card/full-report]', err);
    return NextResponse.json({ error: '详读生成失败' }, { status: 500 });
  }
}
