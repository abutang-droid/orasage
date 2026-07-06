const TAROT_INTERNAL_URL = process.env.TAROT_INTERNAL_URL ?? 'http://127.0.0.1:3112';
const TAROT_INTERNAL_SECRET =
  process.env.TAROT_INTERNAL_SECRET || process.env.JWT_SECRET || '';

export type BlessingMeritSummary = {
  linked: boolean;
  preferredDeity?: string | null;
  prefs?: {
    faith: string | null;
    faithLabelZh: string | null;
    faithLabelEn: string | null;
    countryCode: string | null;
    continentCode: string | null;
    deityId: string | null;
    deityNameZh: string | null;
    deityNameEn: string | null;
  };
  summary?: {
    total: number;
    level: number;
    levelTitleZh: string;
    levelTitleEn: string;
    streak: number;
    prayedToday: boolean;
  };
};

export type MeritRuleRow = {
  condition: string;
  amount: string;
  note?: string;
};

export type MeritDetailSummary = {
  total: number;
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
  meritTime: number;
  meritShare: number;
  meritOffer: number;
  sharePathEnabled: boolean;
  prayedToday: boolean;
};

export type MeritDetailRules = {
  sharePathEnabled: boolean;
  sacredDayMultiplier: number;
  levels: Array<{
    level: number;
    min: number;
    max: number | null;
    titleZh: string;
    titleEn: string;
    titlePt: string;
    privileges: { leaderboard: boolean; unlocksZh: string[] };
  }>;
  time: {
    label: string;
    active: boolean;
    rules: MeritRuleRow[];
    interruptNote?: string;
  };
  share: {
    label: string;
    active: boolean;
    pausedNote?: string;
    rules: MeritRuleRow[];
  };
  offer: {
    label: string;
    active: boolean;
    rules: MeritRuleRow[];
  };
};

export type MeritCheckin = {
  deityName: string;
  worshipStage: number;
  meritEarned: number;
  checkinDate: string;
};

export type BlessingMeritDetail = {
  linked: boolean;
  summary?: MeritDetailSummary;
  recentCheckins?: MeritCheckin[];
  rules?: MeritDetailRules;
};

async function tarotInternalFetch(path: string): Promise<Response | null> {
  if (!TAROT_INTERNAL_SECRET) return null;
  try {
    return await fetch(`${TAROT_INTERNAL_URL}${path}`, {
      headers: { 'x-tarot-internal-key': TAROT_INTERNAL_SECRET },
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

export async function fetchTarotMeritSummary(orasageUserId: number): Promise<BlessingMeritSummary> {
  const res = await tarotInternalFetch(
    `/api/internal/merit/summary?orasageUserId=${orasageUserId}`,
  );
  if (!res?.ok) {
    return { linked: false };
  }
  return (await res.json()) as BlessingMeritSummary;
}

export async function fetchTarotMeritDetail(orasageUserId: number): Promise<BlessingMeritDetail> {
  const res = await tarotInternalFetch(
    `/api/internal/merit/detail?orasageUserId=${orasageUserId}`,
  );
  if (!res?.ok) {
    return { linked: false };
  }
  return (await res.json()) as BlessingMeritDetail;
}
