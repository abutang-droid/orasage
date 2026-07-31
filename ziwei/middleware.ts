import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE, normalizeLocale } from '@orasage/i18n';

/** Persist ?lang= into the shared locale cookie before SSR reads it. */
export function middleware(request: NextRequest) {
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
