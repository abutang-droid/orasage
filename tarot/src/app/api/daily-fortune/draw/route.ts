import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isOrasageLoggedIn } from '@/lib/daily-fortune/auth';
import { generateDailyFortuneReport } from '@/lib/daily-fortune/report';
import {
  createDailyFortuneRecord,
  drawDailyFortuneCard,
  getTodayDailyFortuneRecord,
  saveDailyFortuneRecommendSku,
} from '@/lib/daily-fortune/record';
import type { DailyFortuneAnswer } from '@/lib/daily-fortune/types';
import { consumeDailyFortuneDraw, getDailyFortuneQuota } from '@/lib/daily-fortune-quota';
import { maybeSyncDailyFortuneReading } from '@/lib/daily-fortune/sync';
import { prisma } from '@/lib/prisma';
import { ALL_CARDS } from '@/lib/tarot/cards';
import { buildDailyFortuneDrawSeed, buildTarotAccountRecommendSeed } from '@/lib/reading-stable';
import { fetchTarotDailyRecommendProduct } from '@/lib/tarot-billing-config';
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

async function resolveRecommendSku(userId: string, locale: string, existingSku?: string | null) {
  if (existingSku) return existingSku;
  const product = await fetchTarotDailyRecommendProduct(buildTarotAccountRecommendSeed(userId), locale);
  return product?.sku ?? null;
}

async function respondWithRecord(
  req: NextRequest,
  ensured: { userId: string; newToken?: string },
  record: Awaited<ReturnType<typeof getTodayDailyFortuneRecord>>,
  loggedIn: boolean,
) {
  if (!record) {
    return NextResponse.json({ error: '记录不存在' }, { status: 404 });
  }

  const language = resolveAiLocaleFromRequest(req);
  const recommendSku = await resolveRecommendSku(ensured.userId, language, record.recommendSku);
  if (recommendSku && recommendSku !== record.recommendSku) {
    await saveDailyFortuneRecommendSku(record.id, ensured.userId, recommendSku);
    record = { ...record, recommendSku };
  }

  const syncedRecord = await maybeSyncDailyFortuneReading(
    req.headers.get('cookie'),
    ensured.userId,
    record,
    loggedIn,
  );
  const updatedQuota = await getDailyFortuneQuota(ensured.userId);
  const cardMeta = record.cardId != null ? ALL_CARDS.find((c) => c.id === record.cardId) : null;

  const res = NextResponse.json({
    ok: true,
    record: syncedRecord,
    brief: record.briefText,
    fullReport: loggedIn ? record.fullReport : null,
    isLoggedIn: loggedIn,
    card: cardMeta
      ? cardPayload(cardMeta, (record.orientation as '正位' | '逆位') ?? '正位')
      : null,
    quota: updatedQuota,
    remaining: updatedQuota.remaining,
    recommendSku,
    alreadyDrewToday: true,
  });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
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
    const todayRecord = await getTodayDailyFortuneRecord(ensured.userId, quota.dateKey);

    if (todayRecord) {
      return respondWithRecord(req, ensured, todayRecord, loggedIn);
    }

    const access = await consumeDailyFortuneDraw(ensured.userId);

    if (!access.ok) {
      if (todayRecord) {
        return respondWithRecord(req, ensured, todayRecord, loggedIn);
      }
      const res = NextResponse.json(
        { ok: false, error: 'already_drew_today', remaining: 0 },
        { status: 409 },
      );
      if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
      return res;
    }

    const seed = buildDailyFortuneDrawSeed(ensured.userId, quota.dateKey);
    const { card, orientation } = drawDailyFortuneCard(seed);
    const answers = body.answers as DailyFortuneAnswer[];

    const report = await generateDailyFortuneReport({
      card,
      orientation,
      answers,
      nickname: user?.nickname,
      language,
    });

    const recommendSku = await resolveRecommendSku(ensured.userId, language);

    const record = await createDailyFortuneRecord({
      userId: ensured.userId,
      dateKey: quota.dateKey,
      cardId: card.id,
      cardName: card.name,
      orientation,
      qaAnswers: answers,
      briefText: report.brief,
      fullReport: report.full,
      accessSource: access.source,
      orderNo: null,
      recommendSku,
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
      recommendSku,
      alreadyDrewToday: false,
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
