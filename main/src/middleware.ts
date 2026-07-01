import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/navigation';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(zh-CN|zh-TW|en|pt-BR|es|fr|de|ja|ko|vi|th|ar)/:path*', '/((?!_next|api|favicon.ico).*)'],
};
