import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/fortune' || request.nextUrl.pathname === '/fortune/') {
    return NextResponse.redirect(new URL('/daily-fortune', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/fortune', '/fortune/'],
}
