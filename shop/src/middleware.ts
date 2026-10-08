import { NextResponse, type NextRequest } from 'next/server';

/** Keep in sync with `@orasage/i18n` LOCALE_* — edge middleware must not import that package (eval). */
const LOCALE_COOKIE = 'NEXT_LOCALE';
const LOCALE_OVERRIDE_COOKIE = 'orasage_shop_locale';

/** Request header so next-intl `request.ts` can read ?lang= on the same hop. */
export const SHOP_LOCALE_HEADER = 'x-orasage-locale';

function normalizeLocale(input?: string | null): string {
  if (!input?.trim()) return 'zh-CN';
  const lower = input.trim().replace('_', '-').toLowerCase();
  if (lower === '*' || lower === 'und') return 'zh-CN';
  if (lower === 'zh' || lower === 'zh-hans' || lower.startsWith('zh')) return 'zh-CN';
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en';
  return 'zh-CN';
}

/**
 * Persist ?lang= / ?locale= into shared locale cookies + request header for SSR.
 * Bazi / ziwei / tarot unlock hops must not flip to English via Accept-Language.
 * Default remains zh-CN when query/cookie are absent.
 */
export function middleware(request: NextRequest) {
  const lang =
    request.nextUrl.searchParams.get('lang')
    ?? request.nextUrl.searchParams.get('locale');

  const requestHeaders = new Headers(request.headers);
  // Always forward full URL so SSR can parse query even when cookies are empty.
  requestHeaders.set('x-url', request.url);

  if (!lang) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  const locale = normalizeLocale(lang);
  requestHeaders.set(SHOP_LOCALE_HEADER, locale);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
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
