import { NextResponse, type NextRequest } from 'next/server';
import { CORE_LOCALES, LOCALE_COOKIE, normalizeLocale } from '@orasage/i18n';

/** Propagate ?lang= into request header + NEXT_LOCALE for SSR metadata. */
export function middleware(request: NextRequest) {
  const raw =
    request.nextUrl.searchParams.get('lang') ??
    request.nextUrl.searchParams.get('locale');
  const locale = raw ? normalizeLocale(raw) : null;
  const valid =
    locale && (CORE_LOCALES as readonly string[]).includes(locale) ? locale : null;

  const requestHeaders = new Headers(request.headers);
  if (valid) requestHeaders.set('x-orasage-locale', valid);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (valid) {
    response.cookies.set(LOCALE_COOKIE, valid, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      domain: '.orasage.com',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
