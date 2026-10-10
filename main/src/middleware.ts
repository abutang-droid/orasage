import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/navigation';
import { ORASAGE_PATHNAME_HEADER, stripLocalePrefix } from './lib/portal-pathname';
import { externalUrls } from './lib/urls';

const intlMiddleware = createMiddleware(routing);

const PORTAL_LOCALES = 'zh-CN|en|pt-BR';

/** Deprecated locale paths → phase-1 equivalents (bookmarks / SEO) */
const DEPRECATED_LOCALE_REDIRECT: Record<string, string> = {
  'zh-TW': 'zh-CN',
  es: 'en',
  fr: 'en',
  de: 'en',
  ja: 'en',
  ko: 'en',
  vi: 'en',
  th: 'en',
  ar: 'en',
};

function redirectDeprecatedLocale(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (!match) return null;
  const seg = match[1];
  const rest = match[2] ?? '';
  const target = DEPRECATED_LOCALE_REDIRECT[seg];
  if (!target) return null;
  const url = request.nextUrl.clone();
  url.pathname = `/${target}${rest}`;
  return NextResponse.redirect(url, 308);
}

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

function applyHtmlCacheHeaders(request: NextRequest, response: NextResponse) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return;

  const { pathname } = request.nextUrl;
  const isPrivate =
    pathname === '/' ||
    pathname.includes('/profile') ||
    pathname.startsWith('/api') ||
    pathname.includes('/login');

  if (isPrivate) {
    response.headers.set('Cache-Control', 'private, no-store');
    return;
  }

  // Locale is in the path (`/zh-CN`, `/en`, `/pt-BR`), so HTML is shareable.
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400',
  );
  response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
}

export default function middleware(request: NextRequest) {
  const deprecatedRedirect = redirectDeprecatedLocale(request);
  if (deprecatedRedirect) return deprecatedRedirect;

  const templeRedirect = redirectTemple(request);
  if (templeRedirect) return templeRedirect;

  const zhRedirect = redirectZhAlias(request);
  if (zhRedirect) return zhRedirect;

  const response = intlMiddleware(request);
  response.headers.set(ORASAGE_PATHNAME_HEADER, stripLocalePrefix(request.nextUrl.pathname));
  applyHtmlCacheHeaders(request, response);
  return response;
}

export const config = {
  matcher: [
    '/',
    '/(zh-CN|en|pt-BR|zh-TW|es|fr|de|ja|ko|vi|th|ar)/:path*',
    // 排除静态资源：Next 内部、API、品牌图标（VI v1.0 §6.1）、分享图、
    // 以及物理落盘的商城 CMS 媒体（/cms-media/*，否则会被 locale 前缀重定向成 404）
    '/((?!_next|api|favicon.ico|icon.svg|apple-icon.png|og.png|robots.txt|sitemap.xml|cms-media).*)',
  ],
};
