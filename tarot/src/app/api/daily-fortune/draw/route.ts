import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { generateDailyFortuneReport } from '@/lib/daily-fortune/report';
import { createDailyFortuneRecord, drawDailyFortuneCard } from '@/lib/daily-fortune/record';
import type { DailyFortuneAnswer } from '@/lib/daily-fortune/types';
import { consumeDailyFortuneDraw, getDailyFortuneQuota } from '@/lib/daily-fortune-quota';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
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
  orderNo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { id: ensured.userId },
      select: { email: true, nickname: true },
    });
    const loggedIn = await isOrasageLoggedIn(user?.email);

    const quota = await getDailyFortuneQuota(ensured.userId);
    const access = await consumeDailyFortuneDraw(ensured.userId, {
      orderNo: body.orderNo?.trim() || null,
    });

    if (!access.ok) {
      const res = NextResponse.json(
        { ok: false, error: 'paywall', sku: access.sku, remaining: 0 },
        { status: 402 },
      );
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const seed = `${ensured.userId}:${quota.dateKey}:${Date.now()}`;
    const { card, orientation } = drawDailyFortuneCard(seed);
    const answers = body.answers as DailyFortuneAnswer[];

    const report = await generateDailyFortuneReport({
      card,
      orientation,
      answers,
      nickname: user?.nickname,
    });

    const record = await createDailyFortuneRecord({
      userId: ensured.userId,
      dateKey: quota.dateKey,
      cardId: card.id,
      cardName: card.name,
      orientation,
      qaAnswers: answers,
      briefText: report.brief,
      fullReport: report.full,
      accessSource: access.source ?? 'free_base',
      orderNo: body.orderNo?.trim() || null,
    });

    const updatedQuota = await getDailyFortuneQuota(ensured.userId);

    const res = NextResponse.json({
      ok: true,
      record,
      brief: report.brief,
      fullReport: loggedIn ? report.full : null,
      isLoggedIn: loggedIn,
      llm: report.llm,
      card: {
        id: card.id,
        name: card.name,
        nameEn: card.nameEn,
        symbol: card.symbol,
        orientation,
        element: card.element,
      },
      quota: updatedQuota,
      remaining: access.remaining,
    });
    if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '请完整回答引导问题' }, { status: 400 });
    }
    console.error('[daily-fortune/draw]', err);
    return NextResponse.json({ error: '抽取失败' }, { status: 500 });
  }
}
