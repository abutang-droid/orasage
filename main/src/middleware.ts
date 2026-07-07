import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/navigation';
import { ORASAGE_PATHNAME_HEADER, stripLocalePrefix } from './lib/portal-pathname';
import { externalUrls } from './lib/urls';

const intlMiddleware = createMiddleware(routing);

const PORTAL_LOCALES =
  'zh-CN|zh-TW|en|pt-BR|es|fr|de|ja|ko|vi|th|ar';

/** 祈福在 tarot 子域，主站 /temple 与 /{locale}/temple 统一跳转 */
function redirectTemple(request: NextRequest): NextResponse | null {
  const normalized = request.nextUrl.pathname.replace(/\/$/, '') || '/';
  if (normalized === '/temple') {
    return NextResponse.redirect(externalUrls.temple, 308);
  }
  const localeTemple = new RegExp(`^/(${PORTAL_LOCALES})/temple$`);
  if (localeTemple.test(normalized)) {
    return NextResponse.redirect(externalUrls.temple, 308);
  }
  return null;
}

/** /zh、/zh/... → /zh-CN（报告中的 404 修复） */
function redirectZhAlias(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (pathname === '/zh') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh-CN';
    return NextResponse.redirect(url, 308);
  }
  if (pathname.startsWith('/zh/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/zh\//, '/zh-CN/');
    return NextResponse.redirect(url, 308);
  }
  return null;
}

export default function middleware(request: NextRequest) {
  const templeRedirect = redirectTemple(request);
  if (templeRedirect) return templeRedirect;

  const zhRedirect = redirectZhAlias(request);
  if (zhRedirect) return zhRedirect;

  const response = intlMiddleware(request);
  response.headers.set(ORASAGE_PATHNAME_HEADER, stripLocalePrefix(request.nextUrl.pathname));
  return response;
}

export const config = {
  matcher: ['/', '/(zh-CN|zh-TW|en|pt-BR|es|fr|de|ja|ko|vi|th|ar)/:path*', '/((?!_next|api|favicon.ico).*)'],
};
