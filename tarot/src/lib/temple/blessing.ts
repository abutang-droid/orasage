import type { Sanctuary } from '@/lib/cms/sanctuaries';
import { chatCompletion, isLlmConfigured } from '@/lib/llm/client';
import { TAROT_BLESSING_SYSTEM } from '@/lib/llm/prompts';

const BLESSINGS: Record<string, string[]> = {
  guanyin: [
    '慈悲之光已照见你的心愿，今日向前走一步。',
    '心若柔软，路自宽；你所求之事，已在路上。',
  ],
  default: [
    '你的心意已被看见——那些尚未说出口的话，今日宜向前走一步。',
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

export async function generateBlessingTextAsync(opts: {
  deityName: string;
  deityCode: string;
  faithCode?: string | null;
  stage: number;
  streakDays?: number;
  nickname?: string | null;
}): Promise<string> {
  const fallback = generateBlessingText(opts);
  if (!isLlmConfigured()) return fallback;

  const name = opts.nickname && opts.nickname !== '旅人' ? opts.nickname : '有缘人';
  const userPrompt = [
    `昵称：${name}`,
    `神祇：${opts.deityName}（${opts.deityCode}）`,
    opts.faithCode ? `信仰：${opts.faithCode}` : null,
    `参拜阶段：${opts.stage}/3`,
    opts.streakDays ? `连续参拜：${opts.streakDays} 天` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const llm = await chatCompletion({
    system: TAROT_BLESSING_SYSTEM,
    user: userPrompt,
    maxTokens: 200,
    temperature: 0.85,
    timeoutMs: 15000,
  });

  if (!llm) return fallback;
  const cleaned = llm.replace(/^["'「]|["'」]$/g, '').trim();
  return cleaned.length >= 8 ? cleaned : fallback;
}

export function blessingFromSanctuary(deity: Pick<Sanctuary, 'id' | 'name' | 'blessingText'>, fallback: string): string {
  return deity.blessingText?.trim() || fallback;
}
