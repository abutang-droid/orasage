import { prisma } from '@/lib/prisma';
import {
  computeStreakAfterCheckin,
  dateKeyUTC,
  getMeritLevel,
  meritForWorshipStage,
  meritProgress,
  streakBonusMerit,
} from '@/lib/merit';

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
  preferredDeity: true,
  faith: true,
} as const;

export type MeritSummary = {
  total: number;
  meritTime: number;
  meritShare: number;
  meritOffer: number;
  level: number;
  levelTitleZh: string;
  levelTitleEn: string;
  streak: number;
  streakLongest: number;
  rank: string;
  progressInLevel: number;
  neededForNext: number | null;
  prayedToday: boolean;
  onboardingCompleted: boolean;
};

export async function getMeritSummary(userId: string): Promise<MeritSummary | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: MERIT_SELECT,
  });
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
    streak: user.streakDays,
    streakLongest: user.streakLongest,
    rank: progress.rankLabel,
    progressInLevel: progress.progressInLevel,
    neededForNext: progress.neededForNext,
    prayedToday: user.lastCheckinDate === today,
    onboardingCompleted: user.onboardingCompleted,
  };
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
  | { ok: true; alreadyCheckedIn: false; meritEarned: number; streakDays: number; levelUp: boolean; summary: MeritSummary }
  | { ok: true; alreadyCheckedIn: true; meritEarned: 0; summary: MeritSummary }
  | { ok: false; reason: string };

export async function recordWorship(input: RecordWorshipInput): Promise<RecordWorshipResult> {
  const today = dateKeyUTC();
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: MERIT_SELECT,
  });
  if (!user) return { ok: false, reason: 'user_not_found' };

  const existing = await prisma.templeCheckin.findUnique({
    where: { userId_checkinDate: { userId: input.userId, checkinDate: today } },
  });

  if (existing) {
    const summary = await getMeritSummary(input.userId);
    if (!summary) return { ok: false, reason: 'user_not_found' };
    return { ok: true, alreadyCheckedIn: true, meritEarned: 0, summary };
  }

  const baseMerit = meritForWorshipStage(input.worshipStage);
  const { streakDays, streakLongest } = computeStreakAfterCheckin(
    user.lastCheckinDate,
    user.streakDays,
    today,
  );
  const bonus = streakBonusMerit(streakDays);
  const meritEarned = baseMerit + bonus;
  const newTotal = user.meritTotal + meritEarned;
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
        ...(input.faithCode ? { faith: input.faithCode } : {}),
        ...(input.markOnboardingComplete ? { onboardingCompleted: true } : {}),
      },
    }),
  ]);

  const summary = await getMeritSummary(input.userId);
  if (!summary) return { ok: false, reason: 'user_not_found' };

  return {
    ok: true,
    alreadyCheckedIn: false,
    meritEarned,
    streakDays,
    levelUp,
    summary,
  };
}
