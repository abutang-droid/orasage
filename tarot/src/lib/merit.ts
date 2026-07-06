/**
 * Merit (功德) levels, streak logic, and worship rewards.
 * Spec: tarot/MANTO_PRODUCT.md §C2–C3
 */

export const MERIT_LEVELS = [
  { level: 0, min: 0, max: 99, titleZh: '朝圣者', titleEn: 'Pilgrim', titlePt: 'Peregrino' },
  { level: 1, min: 100, max: 499, titleZh: '虔信者', titleEn: 'Devotee', titlePt: 'Devoto' },
  { level: 2, min: 500, max: 1999, titleZh: '持光者', titleEn: 'Lightbearer', titlePt: 'Portador da Luz' },
  { level: 3, min: 2000, max: 9999, titleZh: '圣侍', titleEn: 'Sacred Servant', titlePt: 'Servo Sagrado' },
  { level: 4, min: 10000, max: Infinity, titleZh: '近神者', titleEn: 'Close to the Divine', titlePt: 'Próximo ao Divino' },
] as const;

export type MeritLevel = (typeof MERIT_LEVELS)[number];

/** §C2 时间之路 — 每日参拜基础功德 */
export const TIME_MERIT = {
  dailyCheckin: 1,
  streakMilestones: {
    7: 3,
    30: 15,
    365: 200,
    1000: 1000,
  },
  cumulativeMilestones: {
    3650: 5000,
    18250: 30000,
  },
  /** 50 年累计参拜 — 直接晋升近神者门槛 */
  divinePromotionTotalDays: 18250,
  divinePromotionMinMerit: 10000,
} as const;

/** §C2 供养之路 — 单次行为 */
export const OFFER_MERIT = {
  paid_reading: 2,
  crystal_purchase: 10,
  crystal_gift: 25,
} as const;

/** P5 祈福乐捐 — SKU 与功德公式（实现见 shared/tarot-merit/donation.ts） */
import {
  TEMPLE_DONATION,
  randomIntInclusive,
  randomTempleDonationMultiplier,
  computeTempleDonationMerit,
  templeDonationMeritRange,
  resolveTarotOfferKind,
  type TarotOfferMeritKind,
} from '../../../shared/tarot-merit/donation';

export {
  TEMPLE_DONATION,
  randomIntInclusive,
  randomTempleDonationMultiplier,
  computeTempleDonationMerit,
  templeDonationMeritRange,
  type TarotOfferMeritKind,
  resolveTarotOfferKind,
};

export type OfferMeritKind = keyof typeof OFFER_MERIT | 'temple_donation';

/** §C2 供养之路 — 累计消费里程碑（美分） */
export const OFFER_SPENT_MILESTONES: ReadonlyArray<{ cents: number; bonus: number }> = [
  { cents: 10000, bonus: 50 },
  { cents: 100000, bonus: 200 },
  { cents: 1000000, bonus: 2000 },
  { cents: 10000000, bonus: 10000 },
];

/** 传播之路常量保留；发功由 MERIT_SHARE_PATH_ENABLED 关闭 */
export const SHARE_MERIT = {
  link_click: 1,
  daily_cap: 5,
  referral_first_worship: 10,
  referral_first_paid_reading: 50,
  referral_crystal: 100,
} as const;

export const MERIT_SHARE_PATH_ENABLED = false;

export const REFERRAL_LEVEL_BONUS: Record<number, number> = {
  1: 200,
  2: 500,
};

/** §C3 阶位权限说明（UI 展示） */
export const LEVEL_PRIVILEGES: Record<
  number,
  { leaderboard: boolean; unlocksZh: string[] }
> = {
  0: {
    leaderboard: false,
    unlocksZh: ['每日参拜积累时间功德', '阶位只升不降'],
  },
  1: {
    leaderboard: false,
    unlocksZh: ['长香参拜特效（更多粒子与光环）'],
  },
  2: {
    leaderboard: true,
    unlocksZh: ['功德榜可见（可匿名）', '每月 1 次免费三牌阵占卜', '专属神像光晕特效'],
  },
  3: {
    leaderboard: true,
    unlocksZh: ['每月 2 次免费占卜', '功德榜默认展示（可切匿名）'],
  },
  4: {
    leaderboard: true,
    unlocksZh: ['社区治理投票权', '水晶 8 折', '功德榜展示称号与地区'],
  },
};

/** 计算单次每日参拜的时间功德（不含神圣日倍数） */
export function computeDailyTimeMerit(streakDays: number, totalCheckins: number): number {
  let merit = TIME_MERIT.dailyCheckin;

  const streakBonus =
    TIME_MERIT.streakMilestones[streakDays as keyof typeof TIME_MERIT.streakMilestones];
  if (streakBonus) merit += streakBonus;

  const cumulativeBonus =
    TIME_MERIT.cumulativeMilestones[totalCheckins as keyof typeof TIME_MERIT.cumulativeMilestones];
  if (cumulativeBonus) merit += cumulativeBonus;

  return merit;
}

/** @deprecated 参拜深度不再单独计功德；保留供旧客户端估算 */
export function meritForWorshipStage(_stage: number): number {
  return TIME_MERIT.dailyCheckin;
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
  return TIME_MERIT.streakMilestones[streakDays as keyof typeof TIME_MERIT.streakMilestones] ?? 0;
}

export function cumulativeCheckinBonus(totalCheckins: number): number {
  return TIME_MERIT.cumulativeMilestones[totalCheckins as keyof typeof TIME_MERIT.cumulativeMilestones] ?? 0;
}

/** @deprecated 已并入 computeDailyTimeMerit */
export function onboardingDayBonus(_checkinCount: number): number {
  return 0;
}

/** 初一/十五及固定节日 — 功德 ×2 */
export function sacredDayMultiplier(date = new Date()): number {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  if (d === 1 || d === 15) return 2;
  if (m === 12 && d === 25) return 2;
  if (m === 1 && d === 1) return 2;
  return 1;
}

export const OFFER_MERIT_RULES = OFFER_MERIT;

export const SHARE_MERIT_RULES = SHARE_MERIT;

export const ONBOARDING_STEPS = ['welcome', 'reading', 'faith', 'deity', 'worship', 'done'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function nextOnboardingStep(step: string): OnboardingStep {
  const i = ONBOARDING_STEPS.indexOf(step as OnboardingStep);
  if (i < 0 || i >= ONBOARDING_STEPS.length - 1) return 'done';
  return ONBOARDING_STEPS[i + 1];
}

/** 持光者及以上每月免费占卜次数（MANTO_PRODUCT.md §C3） */
export const LEVEL_MONTHLY_FREE_READINGS: Record<number, number> = {
  2: 1,
  3: 2,
  4: 2,
};

export const FREE_READING_GRANTS = {
  initial: 1,
  worshipDay7: 1,
} as const;

export type MeritRuleRow = {
  condition: string;
  amount: string;
  note?: string;
};

/** API / 功德说明页 — 规则元数据 */
export const MERIT_RULES = {
  sharePathEnabled: MERIT_SHARE_PATH_ENABLED,
  sacredDayMultiplier: 2,
  templeDonation: TEMPLE_DONATION,
  levels: MERIT_LEVELS.map((l) => ({
    level: l.level,
    min: l.min,
    max: l.max === Infinity ? null : l.max,
    titleZh: l.titleZh,
    titleEn: l.titleEn,
    titlePt: l.titlePt,
    privileges: LEVEL_PRIVILEGES[l.level],
  })),
  time: {
    label: '日积月累',
    accent: 'time' as const,
    active: true,
    rules: [
      { condition: '每日参拜', amount: '+1/天', note: '每天仅一次' },
      { condition: '连续 7 天', amount: '+3 额外' },
      { condition: '连续 30 天', amount: '+15 额外' },
      { condition: '连续 365 天', amount: '+200 额外', note: '解锁「恒修者」称号' },
      { condition: '连续 1,000 天', amount: '+1,000 额外' },
      { condition: '累计 3,650 天（10 年）', amount: '+5,000 额外' },
      { condition: '累计 18,250 天（50 年）', amount: '+30,000', note: '直接晋升近神者' },
    ] satisfies MeritRuleRow[],
    interruptNote: '中断后连续计数归零，累计功德不丢。',
  },
  share: {
    label: '传播之路',
    accent: 'share' as const,
    active: false,
    pausedNote: '分享与推荐奖励已暂停，历史传播功德仍计入总功德。',
    rules: [
      { condition: '分享链接被点击', amount: '+1/次', note: '日上限 5' },
      { condition: '被分享者完成首次参拜', amount: '+10/人' },
      { condition: '被分享者首次付费占卜', amount: '+50/人' },
      { condition: '被分享者购买水晶', amount: '+100/人' },
      { condition: '被分享者达到虔信者', amount: '+200/人' },
      { condition: '被分享者达到持光者', amount: '+500/人' },
    ] satisfies MeritRuleRow[],
  },
  offer: {
    label: '诚心供养',
    accent: 'offer' as const,
    active: true,
    rules: [
      { condition: '完成一次付费占卜', amount: `+${OFFER_MERIT.paid_reading}` },
      { condition: '购买水晶手串', amount: `+${OFFER_MERIT.crystal_purchase}` },
      { condition: '为他人购买水晶（赠礼）', amount: `+${OFFER_MERIT.crystal_gift}` },
      {
        condition: '祈福乐捐',
        amount: '依金额计入供养功德',
        note: `$${(TEMPLE_DONATION.minCentsUsd / 100).toFixed(2)}–$${(TEMPLE_DONATION.maxCentsUsd / 100).toFixed(2)} 自愿供养`,
      },
      { condition: '累计消费 $100', amount: '+50' },
      { condition: '累计消费 $1,000', amount: '+200' },
      { condition: '累计消费 $10,000', amount: '+2,000' },
      { condition: '累计消费 $100,000', amount: '+10,000' },
    ] satisfies MeritRuleRow[],
  },
} as const;
