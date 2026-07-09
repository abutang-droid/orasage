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

export const LOCALE_LABELS: Record<CoreLocale, string> = {
  'zh-CN': SHARED_LOCALE_LABELS['zh-CN'],
  'zh-TW': SHARED_LOCALE_LABELS['zh-TW'],
  en: SHARED_LOCALE_LABELS.en,
  'pt-BR': SHARED_LOCALE_LABELS['pt-BR'],
};

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
  if (locale === 'zh-CN') url.searchParams.delete(param);
  else url.searchParams.set(param, locale);
  window.location.assign(url.toString());
}
