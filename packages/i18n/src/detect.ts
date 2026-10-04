import { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from './locales';
import { normalizeLocale } from './normalize';

export type DetectLocaleOptions = {
  queryLocale?: string | null;
  /** Portal path locale from document.referrer (orasage.com/zh-CN/…). */
  referrerLocale?: string | null;
  cookieLocale?: string | null;
  /** Server-only fallback. Browser detection must not pass this. */
  acceptLanguage?: string | null;
};

/**
 * Unified locale detection priority:
 * ?lang= / ?locale= > portal referrer path > cookie > default zh-CN
 *
 * Browser detection does not use Accept-Language. Portal `localeCookie` is
 * off, so an English phone would otherwise flip 八字/紫微/塔罗 to English
 * after a Chinese /zh-CN visit.
 */
export function detectLocale(options?: DetectLocaleOptions): string {
  if (options?.queryLocale) return normalizeLocale(options.queryLocale);
  if (options?.referrerLocale) return normalizeLocale(options.referrerLocale);
  if (options?.cookieLocale) return normalizeLocale(options.cookieLocale);
  if (options?.acceptLanguage) {
    const first = options.acceptLanguage.split(',')[0]?.split(';')[0]?.trim();
    if (first) return normalizeLocale(first);
  }
  return normalizeLocale(null);
}

const PORTAL_PATH_LOCALES = new Set(['zh-CN', 'en', 'pt-BR', 'zh-TW']);

/** Read /zh-CN or ?lang= from an orasage.com referrer. */
export function localeFromReferrerUrl(referrer?: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const host = url.hostname;
    if (host !== 'orasage.com' && !host.endsWith('.orasage.com')) return null;
    const seg = url.pathname.split('/').filter(Boolean)[0];
    if (seg && PORTAL_PATH_LOCALES.has(seg)) return seg;
    return url.searchParams.get('lang') ?? url.searchParams.get('locale');
  } catch {
    return null;
  }
}

export function detectLocaleFromBrowser(): string {
  if (typeof window === 'undefined') return normalizeLocale(null);
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang') ?? params.get('locale');
  const cookies = document.cookie.split(';').map((c) => c.trim());
  const readCookie = (name: string) =>
    cookies.find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
  return detectLocale({
    queryLocale: queryLang,
    referrerLocale: localeFromReferrerUrl(document.referrer),
    cookieLocale: readCookie(LOCALE_OVERRIDE_COOKIE) ?? readCookie(LOCALE_COOKIE),
  });
}

export { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE };
