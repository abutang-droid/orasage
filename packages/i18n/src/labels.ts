import type { ExtendedLocale } from './locales';

export const LOCALE_LABELS: Record<ExtendedLocale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  'pt-BR': 'Português',
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
  return LOCALE_LABELS[locale as ExtendedLocale] ?? LOCALE_LABELS.en ?? fallback;
}
