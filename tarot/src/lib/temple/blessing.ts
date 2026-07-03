import type { Sanctuary } from '@/lib/cms/sanctuaries';

const BLESSINGS: Record<string, string[]> = {
  guanyin: [
    '慈悲之光已照见你的心愿，今日向前走一步。',
    '心若柔软，路自宽；你所求之事，已在路上。',
  ],
  default: [
    '她看见你心里的那团火——那是还没说出口的话。今天，向前走一步。',
    '静默之中，答案已浮现。相信你的直觉。',
  ],
};

export function generateBlessingText(opts: {
  deityName: string;
  deityCode: string;
  faithCode?: string | null;
  stage: number;
  streakDays?: number;
  nickname?: string | null;
}): string {
  const pool = BLESSINGS[opts.deityCode] ?? BLESSINGS.default;
  const base = pool[opts.stage >= 3 ? 0 : 1] ?? pool[0];
  const name = opts.nickname && opts.nickname !== '旅人' ? opts.nickname : '有缘人';
  if (opts.stage >= 3 && opts.streakDays && opts.streakDays >= 7) {
    return `${name}，连续 ${opts.streakDays} 日的虔诚已被看见。${base}`;
  }
  return `${name}，${base}`;
}

export function blessingFromSanctuary(deity: Pick<Sanctuary, 'id' | 'name' | 'blessingText'>, fallback: string): string {
  return deity.blessingText?.trim() || fallback;
}
