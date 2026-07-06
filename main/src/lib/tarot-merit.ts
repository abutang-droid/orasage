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

export async function fetchTarotMeritSummary(orasageUserId: number): Promise<BlessingMeritSummary> {
  if (!TAROT_INTERNAL_SECRET) {
    return { linked: false };
  }
  try {
    const res = await fetch(
      `${TAROT_INTERNAL_URL}/api/internal/merit/summary?orasageUserId=${orasageUserId}`,
      {
        headers: { 'x-tarot-internal-key': TAROT_INTERNAL_SECRET },
        cache: 'no-store',
      },
    );
    if (!res.ok) {
      return { linked: false };
    }
    return (await res.json()) as BlessingMeritSummary;
  } catch {
    return { linked: false };
  }
}
