import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  computeStreakAfterCheckin,
  computeDailyTimeMerit,
  dateKeyUTC,
  getMeritLevel,
  meritProgress,
  sacredDayMultiplier,
  TIME_MERIT,
  REFERRAL_LEVEL_BONUS,
  SHARE_MERIT,
  MERIT_SHARE_PATH_ENABLED,
  OFFER_MERIT,
  OFFER_SPENT_MILESTONES,
  type OnboardingStep,
  nextOnboardingStep,
} from '@/lib/merit';
import { generateReferralCode } from '@/lib/referral';
import { maybeGrantMonthlyLevelFreeReadings, maybeGrantWorshipDay7FreeReading } from '@/lib/free-readings';

const MERIT_SELECT = {
  meritTotal: true,
  meritTime: true,
  meritShare: true,
  meritOffer: true,
  meritLevel: true,
  streakDays: true,
  streakLongest: true,
  lastCheckinDate: true,
  onboardingCompleted: true,
  onboardingStep: true,
  preferredDeity: true,
  faith: true,
  referredByUserId: true,
  nickname: true,
  totalSpentCents: true,
  freeReadingsRemaining: true,
} as const;

export type MeritSummary = {
  total: number;
  meritTime: number;
  meritShare: number;
  meritOffer: number;
  level: number;
  levelTitleZh: string;
  levelTitleEn: string;
  levelTitlePt: string;
  streak: number;
  streakLongest: number;
  totalCheckins: number;
  totalSpentCents: number;
  rank: string;
  progressInLevel: number;
  neededForNext: number | null;
  prayedToday: boolean;
  onboardingCompleted: boolean;
  onboardingStep: string;
  referralCode: string | null;
  freeReadingsRemaining: number;
  sharePathEnabled: boolean;
};

export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;

  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode();
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      return code;
    } catch {
      /* collision */
    }
  }
  const fallback = generateReferralCode(10);
  await prisma.user.update({ where: { id: userId }, data: { referralCode: fallback } });
  return fallback;
}

export async function getMeritSummary(userId: string): Promise<MeritSummary | null> {
  const [user, totalCheckins] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { ...MERIT_SELECT, referralCode: true },
    }),
    prisma.templeCheckin.count({ where: { userId } }),
  ]);
  if (!user) return null;

  const today = dateKeyUTC();
  const progress = meritProgress(user.meritTotal);
  const levelInfo = getMeritLevel(user.meritTotal);

  return {
    total: user.meritTotal,
    meritTime: user.meritTime,
    meritShare: user.meritShare,
    meritOffer: user.meritOffer,
    level: user.meritLevel,
    levelTitleZh: levelInfo.titleZh,
    levelTitleEn: levelInfo.titleEn,
    levelTitlePt: levelInfo.titlePt,
    streak: user.streakDays,
    streakLongest: user.streakLongest,
    totalCheckins,
    totalSpentCents: user.totalSpentCents,
    rank: progress.rankLabel,
    progressInLevel: progress.progressInLevel,
    neededForNext: progress.neededForNext,
    prayedToday: user.lastCheckinDate === today,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
    referralCode: user.referralCode,
    freeReadingsRemaining: user.freeReadingsRemaining,
    sharePathEnabled: MERIT_SHARE_PATH_ENABLED,
  };
}

type MeritPath = 'time' | 'share' | 'offer';

export type MeritAwarded = {
  ok: true;
  awarded: number;
  levelUp: boolean;
  newTotal: number;
  newLevel: number;
};

export type AwardMeritResult =
  | MeritAwarded
  | { ok: true; duplicate: true; awarded: 0 }
  | { ok: false; reason: string };

export function isMeritAwarded(result: AwardMeritResult): result is MeritAwarded {
  return result.ok && !('duplicate' in result && result.duplicate);
}

export async function awardMerit(input: {
  userId: string;
  path: MeritPath;
  amount: number;
  reason: string;
  idempotencyKey?: string;
  applySacredMultiplier?: boolean;
}): Promise<AwardMeritResult> {
  if (input.amount <= 0) return { ok: false, reason: 'invalid_amount' };

  if (input.idempotencyKey) {
    const dup = await prisma.meritLog.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (dup) return { ok: true, duplicate: true, awarded: 0 };
  }

  const multiplier = input.applySacredMultiplier ? sacredDayMultiplier() : 1;
  const amount = Math.round(input.amount * multiplier);

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { meritTotal: true, meritTime: true, meritShare: true, meritOffer: true, meritLevel: true },
  });
  if (!user) return { ok: false, reason: 'user_not_found' };

  const pathField =
    input.path === 'time' ? 'meritTime' : input.path === 'share' ? 'meritShare' : 'meritOffer';
  const newPathValue = user[pathField] + amount;
  const newTotal = user.meritTotal + amount;
  const newLevel = getMeritLevel(newTotal).level;
  const levelUp = newLevel > user.meritLevel;

  try {
    await prisma.$transaction([
      prisma.meritLog.create({
        data: {
          userId: input.userId,
          path: input.path,
          amount,
          reason: input.reason,
          idempotencyKey: input.idempotencyKey,
        },
      }),
      prisma.user.update({
        where: { id: input.userId },
        data: {
          meritTotal: newTotal,
          meritLevel: newLevel,
          [pathField]: newPathValue,
        },
      }),
    ]);
  } catch (err) {
    if (
      input.idempotencyKey &&
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return { ok: true, duplicate: true, awarded: 0 };
    }
    throw err;
  }

  return { ok: true, awarded: amount, levelUp, newTotal, newLevel };
}

async function maybeAwardReferrerLevelBonus(userId: string, oldLevel: number, newLevel: number) {
  if (!MERIT_SHARE_PATH_ENABLED) return;
  if (newLevel <= oldLevel) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredByUserId: true },
  });
  if (!user?.referredByUserId) return;

  const bonus = REFERRAL_LEVEL_BONUS[newLevel];
  if (!bonus) return;

  await awardMerit({
    userId: user.referredByUserId,
    path: 'share',
    amount: bonus,
    reason: `referral_level_${newLevel}`,
    idempotencyKey: `referral:level:${userId}:${newLevel}`,
  });
}

export async function bindReferralCode(userId: string, code: string): Promise<{ ok: boolean; reason?: string }> {
  if (!MERIT_SHARE_PATH_ENABLED) return { ok: false, reason: 'share_path_disabled' };
  const normalized = code.trim().toLowerCase();
  if (!normalized) return { ok: false, reason: 'empty_code' };

  const self = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredByUserId: true, referralCode: true },
  });
  if (!self) return { ok: false, reason: 'user_not_found' };
  if (self.referredByUserId) return { ok: false, reason: 'already_bound' };
  if (self.referralCode?.toLowerCase() === normalized) return { ok: false, reason: 'self_referral' };

  const referrer = await prisma.user.findFirst({
    where: { referralCode: normalized },
    select: { id: true },
  });
  if (!referrer) return { ok: false, reason: 'invalid_code' };

  await prisma.user.update({
    where: { id: userId },
    data: { referredByUserId: referrer.id },
  });
  return { ok: true };
}

export async function recordShareClick(userId: string): Promise<AwardMeritResult> {
  if (!MERIT_SHARE_PATH_ENABLED) {
    return { ok: true, duplicate: true, awarded: 0 };
  }
  const today = dateKeyUTC();
  const count = await prisma.meritLog.count({
    where: {
      userId,
      path: 'share',
      reason: 'share_click',
      createdAt: { gte: new Date(`${today}T00:00:00.000Z`) },
    },
  });
  if (count >= SHARE_MERIT.daily_cap) {
    return { ok: true, duplicate: true, awarded: 0 };
  }

  return awardMerit({
    userId,
    path: 'share',
    amount: SHARE_MERIT.link_click,
    reason: 'share_click',
    idempotencyKey: `share:click:${userId}:${today}:${count + 1}`,
  });
}

export async function recordOfferMerit(
  userId: string,
  kind: keyof typeof OFFER_MERIT,
  opts?: { orderNo?: string; amountCents?: number },
): Promise<AwardMeritResult> {
  const amount = OFFER_MERIT[kind];
  const idempotencyKey = opts?.orderNo ? `offer:${kind}:${opts.orderNo}` : undefined;

  if (!idempotencyKey) {
    return { ok: false, reason: 'order_required' };
  }

  const existing = await prisma.meritLog.findUnique({ where: { idempotencyKey } });
  if (existing) return { ok: true, duplicate: true, awarded: 0 };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalSpentCents: true, referredByUserId: true },
  });
  if (!user) return { ok: false, reason: 'user_not_found' };

  const oldSpent = user.totalSpentCents;
  const newSpent = oldSpent + (opts?.amountCents ?? 0);

  const result = await awardMerit({
    userId,
    path: 'offer',
    amount,
    reason: kind,
    idempotencyKey,
    applySacredMultiplier: true,
  });

  if (!result.ok || ('duplicate' in result && result.duplicate)) {
    return result;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { totalSpentCents: newSpent },
  });

  if (user.referredByUserId && MERIT_SHARE_PATH_ENABLED) {
    if (kind === 'paid_reading') {
      await awardMerit({
        userId: user.referredByUserId,
        path: 'share',
        amount: SHARE_MERIT.referral_first_paid_reading,
        reason: 'referral_first_paid_reading',
        idempotencyKey: `referral:paid_reading:${userId}`,
      });
    } else if (kind === 'crystal_purchase' || kind === 'crystal_gift') {
      await awardMerit({
        userId: user.referredByUserId,
        path: 'share',
        amount: SHARE_MERIT.referral_crystal,
        reason: 'referral_crystal',
        idempotencyKey: `referral:crystal:${userId}`,
      });
    }
  }

  for (const { cents, bonus } of OFFER_SPENT_MILESTONES) {
    if (oldSpent < cents && newSpent >= cents) {
      await awardMerit({
        userId,
        path: 'offer',
        amount: bonus,
        reason: `spent_milestone_${cents}`,
        idempotencyKey: `offer:milestone:${userId}:${cents}`,
      });
    }
  }

  return result;
}

export type RecordWorshipInput = {
  userId: string;
  deityCode: string;
  deityName: string;
  faithCode?: string | null;
  worshipStage: number;
  durationSec: number;
  markOnboardingComplete?: boolean;
};

export type RecordWorshipResult =
  | {
      ok: true;
      alreadyCheckedIn: false;
      meritEarned: number;
      streakDays: number;
      levelUp: boolean;
      blessingText: string;
      summary: MeritSummary;
    }
  | { ok: true; alreadyCheckedIn: true; meritEarned: 0; blessingText: string; summary: MeritSummary }
  | { ok: false; reason: string };

export async function advanceOnboarding(userId: string, step: OnboardingStep): Promise<OnboardingStep> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingStep: true },
  });
  if (!user) return 'welcome';

  const currentIdx = ['welcome', 'reading', 'faith', 'deity', 'worship', 'done'].indexOf(user.onboardingStep);
  const targetIdx = ['welcome', 'reading', 'faith', 'deity', 'worship', 'done'].indexOf(step);
  if (targetIdx <= currentIdx) return user.onboardingStep as OnboardingStep;

  const next = step;
  await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingStep: next,
      ...(next === 'done' ? { onboardingCompleted: true } : {}),
    },
  });
  return next;
}

export async function recordWorship(input: RecordWorshipInput): Promise<RecordWorshipResult> {
  const today = dateKeyUTC();
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: MERIT_SELECT,
  });
  if (!user) return { ok: false, reason: 'user_not_found' };

  const { generateBlessingTextAsync } = await import('@/lib/temple/blessing');

  const existing = await prisma.templeCheckin.findUnique({
    where: { userId_checkinDate: { userId: input.userId, checkinDate: today } },
  });

  if (existing) {
    const summary = await getMeritSummary(input.userId);
    if (!summary) return { ok: false, reason: 'user_not_found' };
    const blessingText = await generateBlessingTextAsync({
      deityName: input.deityName,
      deityCode: input.deityCode,
      faithCode: input.faithCode,
      stage: input.worshipStage,
      streakDays: user.streakDays,
      nickname: user.nickname,
    });
    return { ok: true, alreadyCheckedIn: true, meritEarned: 0, blessingText, summary };
  }

  const { streakDays: nextStreakDays } = computeStreakAfterCheckin(
    user.lastCheckinDate,
    user.streakDays,
    today,
  );
  const streakDays = nextStreakDays;
  const streakLongest = Math.max(user.streakLongest, streakDays);

  const priorCheckins = await prisma.templeCheckin.count({ where: { userId: input.userId } });
  const totalCheckins = priorCheckins + 1;
  const rawMerit = computeDailyTimeMerit(streakDays, totalCheckins);
  const multiplier = sacredDayMultiplier();
  let meritEarned = Math.round(rawMerit * multiplier);

  let newTotal = user.meritTotal + meritEarned;
  if (
    totalCheckins === TIME_MERIT.divinePromotionTotalDays &&
    newTotal < TIME_MERIT.divinePromotionMinMerit
  ) {
    const boost = TIME_MERIT.divinePromotionMinMerit - newTotal;
    meritEarned += boost;
    newTotal = TIME_MERIT.divinePromotionMinMerit;
  }

  const newMeritTime = user.meritTime + meritEarned;
  const newLevel = getMeritLevel(newTotal).level;
  const levelUp = newLevel > user.meritLevel;

  await prisma.$transaction([
    prisma.templeCheckin.create({
      data: {
        userId: input.userId,
        deityCode: input.deityCode,
        deityName: input.deityName,
        faithCode: input.faithCode ?? null,
        worshipStage: input.worshipStage,
        durationSec: input.durationSec,
        meritEarned,
        checkinDate: today,
      },
    }),
    prisma.meritLog.create({
      data: {
        userId: input.userId,
        path: 'time',
        amount: meritEarned,
        reason: multiplier > 1 ? 'daily_worship_sacred' : 'daily_worship',
        idempotencyKey: `worship:${input.userId}:${today}`,
      },
    }),
    prisma.user.update({
      where: { id: input.userId },
      data: {
        meritTotal: newTotal,
        meritTime: newMeritTime,
        meritLevel: newLevel,
        streakDays,
        streakLongest,
        lastCheckinDate: today,
        preferredDeity: input.deityCode,
        onboardingStep: input.markOnboardingComplete ? 'done' : user.onboardingStep,
        ...(input.faithCode ? { faith: input.faithCode } : {}),
        ...(input.markOnboardingComplete ? { onboardingCompleted: true } : {}),
      },
    }),
  ]);

  if (priorCheckins === 0 && user.referredByUserId && MERIT_SHARE_PATH_ENABLED) {
    await awardMerit({
      userId: user.referredByUserId,
      path: 'share',
      amount: SHARE_MERIT.referral_first_worship,
      reason: 'referral_first_worship',
      idempotencyKey: `referral:worship:${input.userId}`,
    });
  }

  if (levelUp) {
    await maybeAwardReferrerLevelBonus(input.userId, user.meritLevel, newLevel);
  }

  await maybeGrantWorshipDay7FreeReading(input.userId, streakDays, priorCheckins + 1);
  await maybeGrantMonthlyLevelFreeReadings(input.userId);

  const { grantDailyFortuneTempleBonus } = await import('@/lib/daily-fortune-quota');
  await grantDailyFortuneTempleBonus(input.userId, today);

  await advanceOnboarding(input.userId, input.markOnboardingComplete ? 'done' : 'worship');

  const summary = await getMeritSummary(input.userId);
  if (!summary) return { ok: false, reason: 'user_not_found' };

  const blessingText = await generateBlessingTextAsync({
    deityName: input.deityName,
    deityCode: input.deityCode,
    faithCode: input.faithCode,
    stage: input.worshipStage,
    streakDays,
    nickname: user.nickname,
  });

  return {
    ok: true,
    alreadyCheckedIn: false,
    meritEarned,
    streakDays,
    levelUp,
    blessingText,
    summary,
  };
}
