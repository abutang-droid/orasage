import { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from './locales';
import { normalizeLocale } from './normalize';

export type DetectLocaleOptions = {
  queryLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

/**
 * Unified locale detection priority:
 * ?lang= / ?locale= > cookieLocale (caller-supplied) > Accept-Language
 *
 * Callers that read cookies should prefer NEXT_LOCALE over the shop override
 * (design system §10). See detectLocaleFromBrowser.
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
  const queryLang = params.get('lang') || params.get('locale');
  const cookies = document.cookie.split(';').map((c) => c.trim());
  const readCookie = (name: string) => {
    const raw = cookies.find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  };
  // Portal cookie wins; shop override is a fallback only (kept in sync by setLocaleCookie).
  return detectLocale({
    queryLocale: queryLang,
    cookieLocale: readCookie(LOCALE_COOKIE) ?? readCookie(LOCALE_OVERRIDE_COOKIE),
    acceptLanguage: typeof navigator !== 'undefined' ? navigator.language : null,
  });
}

export { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE };
