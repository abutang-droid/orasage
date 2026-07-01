import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';

const PUBLIC_PATHS = ['/', '/products', '/checkout/success', '/api/health', '/api/products', '/api/webhook'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/webhook') ||
    pathname.startsWith('/api/internal')
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const user = await getAuthUser(req);
  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const authUrl = process.env.AUTH_URL ?? 'https://auth.orasage.com';
    const shopUrl = process.env.SHOP_URL ?? req.nextUrl.origin;
    const login = `${authUrl}/login?redirect=${encodeURIComponent(`${shopUrl}${pathname}`)}`;
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
