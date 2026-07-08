/** T1 — fortune apps + shell (zh-CN / zh-TW / en / pt-BR) */
export const CORE_LOCALES = ['zh-CN', 'zh-TW', 'en', 'pt-BR'] as const;
export type CoreLocale = (typeof CORE_LOCALES)[number];

/** T2 — main portal extended set */
export const EXTENDED_LOCALES = [
  'zh-CN',
  'zh-TW',
  'en',
  'pt-BR',
  'es',
  'fr',
  'de',
  'ja',
  'ko',
  'vi',
  'th',
  'ar',
] as const;
export type ExtendedLocale = (typeof EXTENDED_LOCALES)[number];

export type Locale = ExtendedLocale;

export const DEFAULT_LOCALE: CoreLocale = 'zh-CN';

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_OVERRIDE_COOKIE = 'orasage_shop_locale';

export function isCoreLocale(value: string): value is CoreLocale {
  return (CORE_LOCALES as readonly string[]).includes(value);
}

export function isExtendedLocale(value: string): value is ExtendedLocale {
  return (EXTENDED_LOCALES as readonly string[]).includes(value);
}

/** Map extended locale to nearest core locale for fortune apps */
export function toCoreLocale(locale: string): CoreLocale {
  const norm = locale;
  if (isCoreLocale(norm)) return norm;
  if (norm === 'es') return 'en';
  if (norm.startsWith('zh')) return norm.includes('TW') || norm.includes('Hant') ? 'zh-TW' : 'zh-CN';
  if (norm.startsWith('pt')) return 'pt-BR';
  return 'en';
}
