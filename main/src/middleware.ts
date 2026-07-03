import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/navigation';
import { ORASAGE_PATHNAME_HEADER, stripLocalePrefix } from './lib/portal-pathname';

const intlMiddleware = createMiddleware(routing);

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
  const zhRedirect = redirectZhAlias(request);
  if (zhRedirect) return zhRedirect;

  const response = intlMiddleware(request);
  response.headers.set(ORASAGE_PATHNAME_HEADER, stripLocalePrefix(request.nextUrl.pathname));
  return response;
}

export const config = {
  matcher: ['/', '/(zh-CN|zh-TW|en|pt-BR|es|fr|de|ja|ko|vi|th|ar)/:path*', '/((?!_next|api|favicon.ico).*)'],
};
