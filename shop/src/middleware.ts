import { NextResponse, type NextRequest } from 'next/server';
import {
  cookieDomainFromHost,
  detectLocale,
  LOCALE_COOKIE,
  LOCALE_OVERRIDE_COOKIE,
  toCoreLocale,
} from '@orasage/i18n';

/**
 * Apply `?locale=` on the edge so the first SSR paint matches the shared
 * cookie contract (avoids client snap-back after ShopLocaleProvider mounts).
 */
export function middleware(request: NextRequest) {
  const fromQuery = request.nextUrl.searchParams.get('locale');
  if (!fromQuery) return NextResponse.next();

  const locale = toCoreLocale(
    detectLocale({
      queryLocale: fromQuery,
      cookieLocale: null,
      acceptLanguage: null,
    }),
  );

  const response = NextResponse.next();
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.hostname;
  const domain = cookieDomainFromHost(host);
  const base = {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax' as const,
    secure: request.nextUrl.protocol === 'https:',
    ...(domain ? { domain } : {}),
  };
  response.cookies.set(LOCALE_COOKIE, locale, base);
  response.cookies.set(LOCALE_OVERRIDE_COOKIE, locale, base);
  return response;
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
