import { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from './locales';
import { normalizeLocale } from './normalize';

export type DetectLocaleOptions = {
  queryLocale?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

/**
 * Unified locale detection priority:
 * ?lang= / ?locale= > cookieLocale (caller-supplied) > DEFAULT_LOCALE (en)
 *
 * Accept-Language / navigator are intentionally ignored so first-time visitors
 * land on English (onboarding included). Users switch via the locale control;
 * the choice is persisted in NEXT_LOCALE.
 *
 * Callers that read cookies should prefer NEXT_LOCALE over the shop override
 * (design system §10). See detectLocaleFromBrowser.
 */
export function detectLocale(options?: DetectLocaleOptions): string {
  if (options?.queryLocale) return normalizeLocale(options.queryLocale);
  if (options?.cookieLocale) return normalizeLocale(options.cookieLocale);
  // `acceptLanguage` kept on the options type for call-site compatibility; unused.
  void options?.acceptLanguage;
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
  // Do not fall back to navigator.language — first visit stays DEFAULT_LOCALE.
  return detectLocale({
    queryLocale: queryLang,
    cookieLocale: readCookie(LOCALE_COOKIE) ?? readCookie(LOCALE_OVERRIDE_COOKIE),
  });
}

export { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE };
