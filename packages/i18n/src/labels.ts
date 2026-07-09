import type { ExtendedLocale } from './locales';

export const LOCALE_LABELS: Record<ExtendedLocale, string> = {
  'zh-CN': '简体中文',
  en: 'English',
  'pt-BR': 'Português',
};

export function localeLabel(locale: string, fallback = locale): string {
  return LOCALE_LABELS[locale as ExtendedLocale] ?? LOCALE_LABELS.en ?? fallback;
}
