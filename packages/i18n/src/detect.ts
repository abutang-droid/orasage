import { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from './locales';
import { normalizeLocale } from './normalize';

export type DetectLocaleOptions = {
  queryLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

/**
 * Unified locale detection priority:
 * ?lang= > override cookie > NEXT_LOCALE cookie > Accept-Language
 */
export function detectLocale(options?: DetectLocaleOptions): string {
  if (options?.queryLocale) return normalizeLocale(options.queryLocale);
  if (options?.cookieLocale) return normalizeLocale(options.cookieLocale);
  if (options?.acceptLanguage) {
    const first = options.acceptLanguage.split(',')[0]?.split(';')[0]?.trim();
    if (first) return normalizeLocale(first);
  }
  return normalizeLocale(null);
}

export function detectLocaleFromBrowser(): string {
  if (typeof window === 'undefined') return normalizeLocale(null);
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');
  const cookies = document.cookie.split(';').map((c) => c.trim());
  const readCookie = (name: string) =>
    cookies.find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
  return detectLocale({
    queryLocale: queryLang,
    cookieLocale: readCookie(LOCALE_OVERRIDE_COOKIE) ?? readCookie(LOCALE_COOKIE),
    acceptLanguage: typeof navigator !== 'undefined' ? navigator.language : null,
  });
}

export { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE };
