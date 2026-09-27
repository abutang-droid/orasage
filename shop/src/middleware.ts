import { NextResponse, type NextRequest } from 'next/server';
import { stampPromoChannelCookie } from '../../shared/promo-channel/index';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  stampPromoChannelCookie(request.nextUrl.hostname, request.nextUrl.searchParams, response.cookies);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
