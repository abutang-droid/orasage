import {
  DEFAULT_LOCALE,
  EXTENDED_LOCALES,
  LOCALE_LABELS,
  type ExtendedLocale,
} from '@orasage/i18n';

/** T2 portal locales — single source in @orasage/i18n */
export const locales = EXTENDED_LOCALES;

export type Locale = ExtendedLocale;
export const defaultLocale: Locale = DEFAULT_LOCALE;

export const localeNames: Record<Locale, string> = LOCALE_LABELS;
