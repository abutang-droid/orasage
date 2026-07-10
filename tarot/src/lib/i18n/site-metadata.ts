import type { Lang } from '@/lib/i18n/context';
import { localeFromTarotLang } from '@orasage/i18n';
import type { LangMap } from '@/lib/i18n/ui-strings';
import { pick } from '@/lib/i18n/ui-strings';

const site = {
  title: {
    zh: '塔罗占卜 · 每日拜神',
    en: 'Tarot Reading · Daily Blessing',
    pt: 'Tarô · Bênção Diária',
    es: 'Tarot · Bendición Diaria',
  },
  description: {
    zh: '翻开你的牌，神灵在背面 · AI塔罗占卜 × 每日拜神 × 五行水晶',
    en: 'Draw your cards — guidance awaits on the other side · AI tarot × daily worship × elemental crystals',
    pt: 'Tire suas cartas — a orientação está do outro lado · tarô com IA × adoração diária × cristais',
    es: 'Saca tus cartas — la guía está al otro lado · tarot con IA × adoración diaria × cristales',
  },
  onboardingTitle: {
    zh: '认识你 · Manto',
    en: 'Meet You · Manto',
    pt: 'Conhecer você · Manto',
    es: 'Conocerte · Manto',
  },
  onboardingDescription: {
    zh: '塔罗新手引导',
    en: 'Tarot onboarding with Manto',
    pt: 'Introdução ao tarô com Manto',
    es: 'Introducción al tarot con Manto',
  },
} as const satisfies Record<string, LangMap>;

export function siteMetadataForLang(lang: Lang) {
  const locale = localeFromTarotLang(lang).replace('-', '_');
  return {
    title: pick(site.title, lang),
    description: pick(site.description, lang),
    locale,
  };
}

export function onboardingMetadataForLang(lang: Lang) {
  return {
    title: pick(site.onboardingTitle, lang),
    description: pick(site.onboardingDescription, lang),
  };
}
