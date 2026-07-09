import { normalizeLocale } from './normalize';

/** Tarot short lang codes ↔ BCP 47 (phase 1: es maps to English) */
export type TarotLang = 'zh' | 'en' | 'pt' | 'es';

export const TAROT_LANG_TO_LOCALE: Record<TarotLang, string> = {
  zh: 'zh-CN',
  en: 'en',
  pt: 'pt-BR',
  es: 'en',
};

export const LOCALE_TO_TAROT_LANG: Record<string, TarotLang> = {
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  en: 'en',
  'pt-BR': 'pt',
  es: 'en',
};

export function localeFromTarotLang(lang: TarotLang): string {
  return TAROT_LANG_TO_LOCALE[lang] ?? 'zh-CN';
}

export function tarotLangFromLocale(locale: string): TarotLang {
  const norm = normalizeLocale(locale);
  return LOCALE_TO_TAROT_LANG[norm] ?? 'en';
}
