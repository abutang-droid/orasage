import type { Lang } from '@/lib/i18n/context';
import type { LangMap } from '@/lib/i18n/ui-strings';
import { pick } from '@/lib/i18n/ui-strings';

export type DailyCardTypeKey = 'angel' | 'healing' | 'lucky';

const dailyMessages: LangMap[] = [
  {
    zh: '今天的能量在告诉你，放轻松，一切都会好起来的。',
    en: 'Today’s energy says: ease up — things are aligning in your favor.',
    pt: 'A energia de hoje diz: relaxe — as coisas estão se alinhando a seu favor.',
    es: 'La energía de hoy dice: relájate — las cosas se alinean a tu favor.',
  },
  {
    zh: '保持一颗开放的心，今天会有意想不到的美好。',
    en: 'Keep an open heart — unexpected beauty may appear today.',
    pt: 'Mantenha o coração aberto — beleza inesperada pode surgir hoje.',
    es: 'Mantén el corazón abierto — puede aparecer belleza inesperada hoy.',
  },
  {
    zh: '你的努力正在宇宙中引起共鸣，继续前行。',
    en: 'Your efforts are resonating — keep moving forward.',
    pt: 'Seus esforços estão ressoando — continue em frente.',
    es: 'Tus esfuerzos están resonando — sigue adelante.',
  },
  {
    zh: '今天适合做让自己开心的事，你值得被温柔对待。',
    en: 'Do what brings you joy today — you deserve gentleness.',
    pt: 'Faça o que traz alegria hoje — você merece gentileza.',
    es: 'Haz lo que te alegra hoy — mereces gentileza.',
  },
  {
    zh: '一个小小的改变，会带来一整天的不同。',
    en: 'A small shift can change the whole day.',
    pt: 'Uma pequena mudança pode transformar o dia.',
    es: 'Un pequeño cambio puede transformar el día.',
  },
  {
    zh: '相信自己，你比你以为的更强大。',
    en: 'Trust yourself — you are stronger than you think.',
    pt: 'Confie em si — você é mais forte do que imagina.',
    es: 'Confía en ti — eres más fuerte de lo que crees.',
  },
  {
    zh: '今天适合感恩，把注意力放在已经拥有的美好上。',
    en: 'Gratitude suits today — focus on what you already have.',
    pt: 'Gratidão combina com hoje — foque no que já tem.',
    es: 'La gratitud encaja hoy — enfócate en lo que ya tienes.',
  },
];

const cardTypes: Record<DailyCardTypeKey, LangMap> = {
  angel: {
    zh: '天使卡',
    en: 'Angel card',
    pt: 'Carta anjo',
    es: 'Carta ángel',
  },
  healing: {
    zh: '治愈卡',
    en: 'Healing card',
    pt: 'Carta de cura',
    es: 'Carta de sanación',
  },
  lucky: {
    zh: '幸运卡',
    en: 'Lucky card',
    pt: 'Carta da sorte',
    es: 'Carta de suerte',
  },
};

const luckyColors: LangMap[] = [
  { zh: '金色', en: 'gold', pt: 'dourado', es: 'dorado' },
  { zh: '紫色', en: 'purple', pt: 'roxo', es: 'púrpura' },
  { zh: '蓝色', en: 'blue', pt: 'azul', es: 'azul' },
  { zh: '红色', en: 'red', pt: 'vermelho', es: 'rojo' },
  { zh: '绿色', en: 'green', pt: 'verde', es: 'verde' },
];

const luckyTipTemplate: LangMap = {
  zh: '幸运色：{color} | 幸运数字：{number}',
  en: 'Lucky color: {color} | Lucky number: {number}',
  pt: 'Cor da sorte: {color} | Número da sorte: {number}',
  es: 'Color de la suerte: {color} | Número de la suerte: {number}',
};

const CARD_TYPE_KEYS: DailyCardTypeKey[] = ['angel', 'healing', 'lucky'];

export function pickDailyMessage(seed: number, lang: Lang) {
  const map = dailyMessages[Math.abs(seed) % dailyMessages.length];
  return pick(map, lang);
}

export function pickDailyCardType(seed: number, lang: Lang) {
  const key = CARD_TYPE_KEYS[Math.abs(seed) % CARD_TYPE_KEYS.length];
  return { key, label: pick(cardTypes[key], lang) };
}

export function buildLuckyTip(seed: number, lang: Lang) {
  const color = pick(luckyColors[Math.abs(seed) % luckyColors.length], lang);
  const number = String(Math.abs(seed) % 9 + 1);
  return pick(luckyTipTemplate, lang)
    .replace('{color}', color)
    .replace('{number}', number);
}

export function normalizeOrientation(value: string | null | undefined): 'upright' | 'reversed' {
  if (!value) return 'upright';
  const lower = value.toLowerCase();
  if (lower === 'reversed' || lower === '逆位') return 'reversed';
  return 'upright';
}

export function orientationLabel(lang: Lang, orientation: 'upright' | 'reversed') {
  const map: Record<'upright' | 'reversed', LangMap> = {
    upright: {
      zh: '正位',
      en: 'Upright',
      pt: 'Normal',
      es: 'Derecha',
    },
    reversed: {
      zh: '逆位',
      en: 'Reversed',
      pt: 'Invertida',
      es: 'Invertida',
    },
  };
  return pick(map[orientation], lang);
}

export function legacyCardTypeToKey(value: string | null | undefined): DailyCardTypeKey {
  if (value === 'angel' || value === 'healing' || value === 'lucky') return value;
  if (value === '治愈卡') return 'healing';
  if (value === '幸运卡') return 'lucky';
  return 'angel';
}

export function localizeStoredCardType(value: string | null | undefined, lang: Lang) {
  const key = legacyCardTypeToKey(value);
  return pick(cardTypes[key], lang);
}
