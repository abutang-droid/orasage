import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/navigation';
import { ORASAGE_PATHNAME_HEADER, stripLocalePrefix } from './lib/portal-pathname';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  response.headers.set(ORASAGE_PATHNAME_HEADER, stripLocalePrefix(request.nextUrl.pathname));
  return response;
}

export const config = {
  matcher: ['/', '/(zh-CN|zh-TW|en|pt-BR|es|fr|de|ja|ko|vi|th|ar)/:path*', '/((?!_next|api|favicon.ico).*)'],
};
