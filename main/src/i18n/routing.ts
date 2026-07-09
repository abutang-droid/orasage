import {
  DEFAULT_LOCALE,
  PHASE_1_LOCALES,
  LOCALE_LABELS,
  type ExtendedLocale,
} from '@orasage/i18n';

/** Phase 1 portal locales — zh-CN / en / pt-BR */
export const locales = PHASE_1_LOCALES;

export type Locale = ExtendedLocale;
export const defaultLocale: Locale = DEFAULT_LOCALE;

export const localeNames: Record<Locale, string> = LOCALE_LABELS;
