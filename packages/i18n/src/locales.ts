/** Phase 1 — live locales: 简体中文 / English / Português */
export const PHASE_1_LOCALES = ['zh-CN', 'en', 'pt-BR'] as const;
export type Phase1Locale = (typeof PHASE_1_LOCALES)[number];

/** Active set for switchers, routing, and fortune apps */
export const CORE_LOCALES = PHASE_1_LOCALES;
export type CoreLocale = Phase1Locale;

/** Reserved for later phases (zh-TW + T2 portal languages) */
export const FUTURE_LOCALES = [
  'zh-TW',
  'es',
  'fr',
  'de',
  'ja',
  'ko',
  'vi',
  'th',
  'ar',
] as const;

/** Portal routing — phase 1 only */
export const EXTENDED_LOCALES = PHASE_1_LOCALES;
export type ExtendedLocale = Phase1Locale;

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

/** Map any locale tag to the nearest phase-1 locale */
export function toCoreLocale(locale: string): CoreLocale {
  if (isCoreLocale(locale)) return locale;
  const lower = locale.toLowerCase();
  if (lower.startsWith('zh')) return 'zh-CN';
  if (lower.startsWith('pt')) return 'pt-BR';
  return 'en';
}
