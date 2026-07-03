/**
 * Merit (功德) levels, streak logic, and worship rewards.
 * Spec: tarot/MANTO_PRODUCT.md §C2–C3
 */

export const MERIT_LEVELS = [
  { level: 0, min: 0, max: 99, titleZh: '朝圣者', titleEn: 'Pilgrim' },
  { level: 1, min: 100, max: 499, titleZh: '虔信者', titleEn: 'Devotee' },
  { level: 2, min: 500, max: 1999, titleZh: '持光者', titleEn: 'Lightbearer' },
  { level: 3, min: 2000, max: 9999, titleZh: '圣侍', titleEn: 'Sacred Servant' },
  { level: 4, min: 10000, max: Infinity, titleZh: '近神者', titleEn: 'Close to the Divine' },
] as const;

export type MeritLevel = (typeof MERIT_LEVELS)[number];

export function meritForWorshipStage(stage: number): number {
  if (stage >= 3) return 10;
  if (stage >= 2) return 5;
  return 1;
}

export function getMeritLevel(totalMerit: number): MeritLevel {
  const found = [...MERIT_LEVELS].reverse().find((l) => totalMerit >= l.min);
  return found ?? MERIT_LEVELS[0];
}

export function nextMeritLevel(totalMerit: number): MeritLevel | null {
  const current = getMeritLevel(totalMerit);
  return MERIT_LEVELS.find((l) => l.level === current.level + 1) ?? null;
}

export function meritProgress(totalMerit: number): {
  current: MeritLevel;
  next: MeritLevel | null;
  progressInLevel: number;
  neededForNext: number | null;
  rankLabel: string;
} {
  const current = getMeritLevel(totalMerit);
  const next = nextMeritLevel(totalMerit);
  if (!next) {
    return {
      current,
      next: null,
      progressInLevel: 1,
      neededForNext: null,
      rankLabel: `${totalMerit}/${current.max === Infinity ? '∞' : current.max}`,
    };
  }
  const span = next.min - current.min;
  const progressInLevel = Math.min(1, Math.max(0, (totalMerit - current.min) / span));
  return {
    current,
    next,
    progressInLevel,
    neededForNext: next.min - totalMerit,
    rankLabel: `${totalMerit}/${next.min - 1}`,
  };
}

/** Date key in UTC for daily check-in uniqueness */
export function dateKeyUTC(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function computeStreakAfterCheckin(
  lastCheckinDate: string | null | undefined,
  currentStreak: number,
  today = dateKeyUTC(),
): { streakDays: number; streakLongest: number } {
  if (!lastCheckinDate) {
    return { streakDays: 1, streakLongest: Math.max(1, currentStreak) };
  }
  if (lastCheckinDate === today) {
    return { streakDays: currentStreak, streakLongest: currentStreak };
  }

  const last = new Date(`${lastCheckinDate}T00:00:00.000Z`);
  const now = new Date(`${today}T00:00:00.000Z`);
  const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);

  const streakDays = diffDays === 1 ? currentStreak + 1 : 1;
  return {
    streakDays,
    streakLongest: Math.max(currentStreak, streakDays),
  };
}

export function streakBonusMerit(streakDays: number): number {
  if (streakDays >= 365) return 50;
  if (streakDays >= 30) return 10;
  if (streakDays >= 7) return 3;
  return 0;
}
