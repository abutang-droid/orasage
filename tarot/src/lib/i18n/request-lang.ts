import type { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import { detectLocale, LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE } from '@orasage/i18n';
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
  cookieHeader?: string | null;
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}): Lang {
  const cookieLocale =
    options.cookieLocale ??
    (options.cookieHeader
      ? readCookie(options.cookieHeader, LOCALE_COOKIE) ??
        readCookie(options.cookieHeader, LOCALE_OVERRIDE_COOKIE)
      : null);
  const locale = detectLocale({
    queryLocale: options.queryLocale,
    cookieLocale,
    acceptLanguage: options.acceptLanguage,
  });
  return tarotLangFromLocale(locale);
}

export function resolveRequestLang(req: NextRequest): Lang {
  return resolveLangFromParts({
    queryLocale: req.nextUrl.searchParams.get('lang') || req.nextUrl.searchParams.get('locale'),
    cookieHeader: req.headers.get('cookie'),
    acceptLanguage: req.headers.get('accept-language'),
  });
}

export async function resolveServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  // Prefer portal NEXT_LOCALE; shop override is fallback only.
  return resolveLangFromParts({
    cookieLocale:
      cookieStore.get(LOCALE_COOKIE)?.value ??
      cookieStore.get(LOCALE_OVERRIDE_COOKIE)?.value ??
      null,
    acceptLanguage: headerStore.get('accept-language'),
  });
}
