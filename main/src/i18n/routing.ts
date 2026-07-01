export const locales = [
  'zh-CN', 'zh-TW', 'en', 'pt-BR', 'es', 'fr',
  'de', 'ja', 'ko', 'vi', 'th', 'ar',
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-CN';

export const localeNames: Record<Locale, string> = {
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
