import type { NavContext } from './config';

/** T1 locales — fortune apps + shell */
export const CORE_LOCALES = ['zh-CN', 'zh-TW', 'en', 'pt-BR'] as const;
export type CoreLocale = (typeof CORE_LOCALES)[number];

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_LABELS: Record<CoreLocale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  'pt-BR': 'Português',
};

export function isCoreLocale(value: string): value is CoreLocale {
  return (CORE_LOCALES as readonly string[]).includes(value);
}

export function localeLabel(locale: string): string {
  if (isCoreLocale(locale)) return LOCALE_LABELS[locale];
  return locale;
}

export function cookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return undefined;
  if (host === 'orasage.com' || host.endsWith('.orasage.com')) return '.orasage.com';
  return undefined;
}

/** Cross-subdomain locale cookie (design system §10). */
export function setLocaleCookie(locale: string): void {
  if (typeof document === 'undefined') return;
  const domain = cookieDomain();
  const domainPart = domain ? `; domain=${domain}` : '';
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/${domainPart}; max-age=31536000; SameSite=Lax${secure}`;
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
