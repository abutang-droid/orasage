import {
  CORE_LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS as SHARED_LOCALE_LABELS,
  cookieDomain,
  isCoreLocale,
  setLocaleCookie,
  type CoreLocale,
} from '@orasage/i18n';
import type { NavContext } from './config';

export { CORE_LOCALES, LOCALE_COOKIE, cookieDomain, isCoreLocale, setLocaleCookie };
export type { CoreLocale };

export const LOCALE_LABELS = Object.fromEntries(
  CORE_LOCALES.map((code) => [code, SHARED_LOCALE_LABELS[code]]),
) as Record<CoreLocale, string>;

export function localeLabel(locale: string): string {
  if (isCoreLocale(locale)) return LOCALE_LABELS[locale];
  return locale;
}

export function applyLocaleChange(
  locale: string,
  context: NavContext,
  onLocaleChange?: (locale: string) => void,
): void {
  if (typeof window === 'undefined') return;
  setLocaleCookie(locale);
  if (onLocaleChange) {
    onLocaleChange(locale);
    return;
  }

  const url = new URL(window.location.href);
  const param = context === 'shop' ? 'locale' : 'lang';
  url.searchParams.set(param, locale);
  window.location.assign(url.toString());
}
