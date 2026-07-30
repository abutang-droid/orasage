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
      ? readCookie(options.cookieHeader, LOCALE_OVERRIDE_COOKIE) ??
        readCookie(options.cookieHeader, LOCALE_COOKIE)
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
    queryLocale: req.nextUrl.searchParams.get('lang'),
    cookieHeader: req.headers.get('cookie'),
    acceptLanguage: req.headers.get('accept-language'),
  });
}

function queryLocaleFromHeaders(headerStore: Headers): string | null {
  const direct = headerStore.get('x-orasage-locale') ?? headerStore.get('x-locale');
  if (direct?.trim()) return direct.trim();
  for (const raw of [
    headerStore.get('x-url'),
    headerStore.get('x-forwarded-uri'),
    headerStore.get('next-url'),
    headerStore.get('referer'),
  ]) {
    if (!raw) continue;
    try {
      const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'http://localhost');
      const q = url.searchParams.get('lang') ?? url.searchParams.get('locale');
      if (q?.trim()) return q.trim();
    } catch {
      /* ignore */
    }
  }
  return null;
}

export async function resolveServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return resolveLangFromParts({
    queryLocale: queryLocaleFromHeaders(headerStore),
    cookieLocale:
      cookieStore.get(LOCALE_OVERRIDE_COOKIE)?.value ??
      cookieStore.get(LOCALE_COOKIE)?.value ??
      null,
    acceptLanguage: headerStore.get('accept-language'),
  });
}
