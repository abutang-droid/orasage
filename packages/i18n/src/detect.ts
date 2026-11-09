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
 * ?lang= / ?locale= > portal referrer path > default zh-CN
 *
 * Browser detection does not use Accept-Language or leftover locale cookies.
 * Cross-subdomain referrer from orasage.com is origin-only, so a Chinese
 * /zh-CN visit cannot be inferred from document.referrer; fortune apps must
 * receive ?lang= and otherwise stay on zh-CN.
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

function isPortalReferrerHost(host: string): boolean {
  const roots = [
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ROOT_DOMAIN) || '',
    (typeof process !== 'undefined' && process.env?.SITE_ROOT_DOMAIN) || '',
    'orasage.com',
    'orcos.win',
  ]
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  return roots.some((root) => host === root || host.endsWith(`.${root}`));
}

/** Read /zh-CN or ?lang= from portal referrer (orasage.com / orcos.win / …). */
export function localeFromReferrerUrl(referrer?: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const host = url.hostname;
    if (!isPortalReferrerHost(host)) return null;
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
  // Do not read NEXT_LOCALE / orasage_shop_locale here. Portal localeCookie is
  // off, cross-subdomain referrer is origin-only (path /zh-CN stripped), and
  // shop/old Accept-Language leftover cookies were flipping 八字 to English.
  // Persist English only via ?lang=en (language switcher writes that).
  return detectLocale({
    queryLocale: queryLang,
    referrerLocale: localeFromReferrerUrl(document.referrer),
  });
}

export { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE };
