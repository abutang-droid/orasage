import type { Sanctuary } from '@/lib/cms/sanctuaries';
import { chatCompletion, isLlmConfigured } from '@/lib/llm/client';
import { tarotBlessingSystem } from '@/lib/llm/prompts';
import {
  aiPromptLanguageLine,
  type AiLocale,
} from '../../../../shared/ai-locale/index';

type BlessingPools = Record<string, string[]>;

const BLESSINGS_ZH: BlessingPools = {
  guanyin: [
    '慈悲之光已照见你的心愿，今日向前走一步。',
    '心若柔软，路自宽；你所求之事，已在路上。',
  ],
  default: [
    '你的心意已被看见——那些尚未说出口的话，今日宜向前走一步。',
    '静默之中，答案已浮现。相信你的直觉。',
  ],
};

const BLESSINGS_EN: BlessingPools = {
  guanyin: [
    'Compassion has seen your wish — take one step forward today.',
    'A soft heart widens the path; what you seek is already on its way.',
  ],
  default: [
    'Your intention has been seen — the words not yet spoken invite one step forward today.',
    'In stillness the answer rises. Trust what you already know.',
  ],
};

const BLESSINGS_PT: BlessingPools = {
  guanyin: [
    'A compaixão já viu o seu desejo — dê um passo à frente hoje.',
    'Um coração suave alarga o caminho; o que você busca já está a caminho.',
  ],
  default: [
    'Sua intenção foi vista — as palavras ainda não ditas pedem um passo à frente hoje.',
    'No silêncio a resposta emerge. Confie na sua intuição.',
  ],
};

const TRAVELER: Record<AiLocale, string> = {
  'zh-CN': '有缘人',
  'zh-TW': '有緣人',
  en: 'Dear one',
  'pt-BR': 'Querida alma',
};

const DEFAULT_NICKNAMES = new Set(['旅人', '旅人。', 'Traveler', 'Viajante', '有缘人', '有緣人', 'Dear one', 'Querida alma']);

function poolsFor(locale: AiLocale): BlessingPools {
  if (locale === 'en') return BLESSINGS_EN;
  if (locale === 'pt-BR') return BLESSINGS_PT;
  return BLESSINGS_ZH;
}

function displayNickname(nickname: string | null | undefined, locale: AiLocale): string {
  const raw = nickname?.trim();
  if (!raw || DEFAULT_NICKNAMES.has(raw)) return TRAVELER[locale];
  return raw;
}

export function generateBlessingText(opts: {
  deityName: string;
  deityCode: string;
  faithCode?: string | null;
  stage: number;
  streakDays?: number;
  nickname?: string | null;
  language?: AiLocale;
}): string {
  const language = opts.language ?? 'zh-CN';
  const pools = poolsFor(language);
  const pool = pools[opts.deityCode] ?? pools.default;
  const base = pool[opts.stage >= 3 ? 0 : 1] ?? pool[0];
  const name = displayNickname(opts.nickname, language);

  if (opts.stage >= 3 && opts.streakDays && opts.streakDays >= 7) {
    if (language === 'en') {
      return `${name}, ${opts.streakDays} days of devotion have been seen. ${base}`;
    }
    if (language === 'pt-BR') {
      return `${name}, ${opts.streakDays} dias de devoção foram vistos. ${base}`;
    }
    if (language === 'zh-TW') {
      return `${name}，連續 ${opts.streakDays} 日的虔誠已被看見。${base}`;
    }
    return `${name}，连续 ${opts.streakDays} 日的虔诚已被看见。${base}`;
  }

  if (language === 'en' || language === 'pt-BR') {
    return `${name}, ${base}`;
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
  language?: AiLocale;
}): Promise<string> {
  const language = opts.language ?? 'zh-CN';
  const fallback = generateBlessingText({ ...opts, language });
  if (!isLlmConfigured()) return fallback;

  const name = displayNickname(opts.nickname, language);
  const userPrompt = [
    aiPromptLanguageLine(language),
    `昵称：${name}`,
    `神祇：${opts.deityName}（${opts.deityCode}）`,
    opts.faithCode ? `信仰：${opts.faithCode}` : null,
    `参拜阶段：${opts.stage}/3`,
    opts.streakDays ? `连续参拜：${opts.streakDays} 天` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const llm = await chatCompletion({
    system: tarotBlessingSystem(language),
    user: userPrompt,
    maxTokens: 200,
    temperature: 0.85,
    timeoutMs: 15000,
  });

  if (!llm) return fallback;
  const cleaned = llm.replace(/^["'「]|["'」]$/g, '').trim();
  return cleaned.length >= 8 ? cleaned : fallback;
}

export function blessingFromSanctuary(
  deity: Pick<Sanctuary, 'id' | 'name' | 'blessingText'>,
  fallback: string,
): string {
  return deity.blessingText?.trim() || fallback;
}
