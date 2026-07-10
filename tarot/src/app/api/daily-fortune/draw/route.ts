import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { generateDailyFortuneReport } from '@/lib/daily-fortune/report';
import {
  createDailyFortuneRecord,
  drawDailyFortuneCard,
  findDailyFortuneRecordByInputHash,
} from '@/lib/daily-fortune/record';
import type { DailyFortuneAnswer } from '@/lib/daily-fortune/types';
import { consumeDailyFortuneDraw, getDailyFortuneQuota } from '@/lib/daily-fortune-quota';
import { maybeSyncDailyFortuneReading } from '@/lib/daily-fortune/sync';
import { prisma } from '@/lib/prisma';
import { ALL_CARDS } from '@/lib/tarot/cards';
import { buildDailyFortuneInputHash } from '@/lib/reading-stable';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

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

function cardPayload(
  card: { id: number; name: string; nameEn: string; symbol: string; element: string },
  orientation: '正位' | '逆位',
) {
  return {
    id: card.id,
    name: card.name,
    nameEn: card.nameEn,
    symbol: card.symbol,
    orientation,
    element: card.element,
  };
}

export async function POST(req: NextRequest) {
  try {
    const ensured = await ensureAuthUser();
    const body = bodySchema.parse(await req.json());
    const language = resolveAiLocaleFromRequest(req, body);
    const user = await prisma.user.findUnique({
      where: { id: ensured.userId },
      select: { email: true, nickname: true },
    });
    const loggedIn = await isOrasageLoggedIn(user?.email);

    const quota = await getDailyFortuneQuota(ensured.userId);
    const answers = body.answers as DailyFortuneAnswer[];
    const inputHash = buildDailyFortuneInputHash(ensured.userId, quota.dateKey, answers);

    const cached = await findDailyFortuneRecordByInputHash(
      ensured.userId,
      quota.dateKey,
      inputHash,
    );
    if (cached) {
      const syncedRecord = await maybeSyncDailyFortuneReading(
        req.headers.get('cookie'),
        ensured.userId,
        cached,
        loggedIn,
      );
      const updatedQuota = await getDailyFortuneQuota(ensured.userId);
      const cardMeta =
        cached.cardId != null ? ALL_CARDS.find((c) => c.id === cached.cardId) : null;

      const res = NextResponse.json({
        ok: true,
        record: syncedRecord,
        brief: cached.briefText,
        fullReport: loggedIn ? cached.fullReport : null,
        isLoggedIn: loggedIn,
        card: cardMeta
          ? cardPayload(cardMeta, (cached.orientation as '正位' | '逆位') ?? '正位')
          : null,
        quota: updatedQuota,
        remaining: updatedQuota.remaining,
        cached: true,
      });
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

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

    const seed = `${ensured.userId}:${quota.dateKey}:${inputHash}`;
    const { card, orientation } = drawDailyFortuneCard(seed);

    const report = await generateDailyFortuneReport({
      card,
      orientation,
      answers,
      nickname: user?.nickname,
      language,
    });

    const record = await createDailyFortuneRecord({
      userId: ensured.userId,
      dateKey: quota.dateKey,
      inputHash,
      cardId: card.id,
      cardName: card.name,
      orientation,
      qaAnswers: answers,
      briefText: report.brief,
      fullReport: report.full,
      accessSource: access.source ?? 'free_base',
      orderNo: body.orderNo?.trim() || null,
    }).catch(async (err) => {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const raced = await findDailyFortuneRecordByInputHash(
          ensured.userId,
          quota.dateKey,
          inputHash,
        );
        if (raced) return raced;
      }
      throw err;
    });

    const syncedRecord = await maybeSyncDailyFortuneReading(
      req.headers.get('cookie'),
      ensured.userId,
      record,
      loggedIn,
    );

    const updatedQuota = await getDailyFortuneQuota(ensured.userId);

    const res = NextResponse.json({
      ok: true,
      record: syncedRecord,
      brief: report.brief,
      fullReport: loggedIn ? report.full : null,
      isLoggedIn: loggedIn,
      llm: report.llm,
      card: cardPayload(card, orientation),
      quota: updatedQuota,
      remaining: access.remaining,
      cached: false,
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
