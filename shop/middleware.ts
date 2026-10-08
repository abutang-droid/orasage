import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE, LOCALE_OVERRIDE_COOKIE, normalizeLocale } from '@orasage/i18n';

/**
 * Persist ?lang= / ?locale= into shared locale cookies before SSR reads them.
 * Bazi / ziwei / tarot unlock hops must not flip to English via Accept-Language.
 */
export function middleware(request: NextRequest) {
  const lang =
    request.nextUrl.searchParams.get('lang')
    ?? request.nextUrl.searchParams.get('locale');
  if (!lang) return NextResponse.next();

  const locale = normalizeLocale(lang);
  const response = NextResponse.next();
  const cookieOpts = {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax' as const,
  };
  response.cookies.set(LOCALE_COOKIE, locale, cookieOpts);
  response.cookies.set(LOCALE_OVERRIDE_COOKIE, locale, cookieOpts);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
