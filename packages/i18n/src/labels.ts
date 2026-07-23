import type { ExtendedLocale } from './locales';
import { FUTURE_LOCALES } from './locales';

export const LOCALE_LABELS: Record<ExtendedLocale, string> = {
  'zh-CN': '简体中文',
  en: 'English',
  'pt-BR': 'Português',
};

/** Display names for reserved / not-yet-live locales (fallback notices). */
export const FUTURE_LOCALE_LABELS: Record<(typeof FUTURE_LOCALES)[number], string> = {
  'zh-TW': '繁體中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  ar: 'العربية',
};

export function localeLabel(locale: string, fallback = locale): string {
  if (locale in LOCALE_LABELS) return LOCALE_LABELS[locale as ExtendedLocale];
  if (locale in FUTURE_LOCALE_LABELS) {
    return FUTURE_LOCALE_LABELS[locale as (typeof FUTURE_LOCALES)[number]];
  }
  return LOCALE_LABELS.en ?? fallback;
}
