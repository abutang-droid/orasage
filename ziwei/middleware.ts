import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE, normalizeLocale } from '@orasage/i18n';

/** Persist ?lang= into the shared locale cookie before SSR reads it.
 *  P0-4: `/en` (and other portal locale prefixes) → `/` with locale cookie so subdomains return 200. */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, '') || '/';
  const localePrefix = pathname.match(/^\/(zh-CN|en|pt-BR|zh-TW|es|fr|de|ja|ko|vi|th|ar)(\/.*)?$/);
  if (localePrefix) {
    const locale = normalizeLocale(localePrefix[1]);
    const rest = localePrefix[2] || '/';
    const url = request.nextUrl.clone();
    url.pathname = rest === '' ? '/' : rest;
    url.searchParams.set('lang', locale);
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
    return response;
  }

  const lang = request.nextUrl.searchParams.get('lang');
  if (!lang) return NextResponse.next();

  const locale = normalizeLocale(lang);
  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
