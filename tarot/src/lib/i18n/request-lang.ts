import type { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import { detectLocale, localeFromReferrerUrl, LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from '@orasage/i18n';
import { tarotLangFromLocale } from '@/lib/orasage-locale';
import type { Lang } from '@/lib/i18n/context';

export function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function resolveLangFromParts(options: {
  queryLocale?: string | null;
  referrer?: string | null;
  cookieHeader?: string | null;
  cookieLocale?: string | null;
}): Lang {
  const cookieLocale =
    options.cookieLocale ??
    (options.cookieHeader
      ? readCookie(options.cookieHeader, LOCALE_OVERRIDE_COOKIE) ??
        readCookie(options.cookieHeader, LOCALE_COOKIE)
      : null);
  const locale = detectLocale({
    queryLocale: options.queryLocale,
    referrerLocale: localeFromReferrerUrl(options.referrer),
    cookieLocale,
  });
  return tarotLangFromLocale(locale);
}

export function resolveRequestLang(req: NextRequest): Lang {
  return resolveLangFromParts({
    queryLocale: req.nextUrl.searchParams.get('lang'),
    referrer: req.headers.get('referer'),
    cookieHeader: req.headers.get('cookie'),
  });
}

export async function resolveServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const referer = headerStore.get('referer');
  let queryLocale: string | null = null;
  try {
    const url = headerStore.get('x-url') || headerStore.get('x-forwarded-url') || '';
    if (url) {
      const parsed = new URL(url);
      queryLocale = parsed.searchParams.get('lang') ?? parsed.searchParams.get('locale');
    }
  } catch {
    /* ignore */
  }
  return resolveLangFromParts({
    queryLocale,
    referrer: referer,
    cookieLocale:
      cookieStore.get(LOCALE_OVERRIDE_COOKIE)?.value ??
      cookieStore.get(LOCALE_COOKIE)?.value ??
      null,
  });
}
