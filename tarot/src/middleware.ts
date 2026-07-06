import { NextRequest, NextResponse } from "next/server"

const MAIN_PROFILE = "https://orasage.com/zh-CN/profile"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/"

  if (pathname === "/fortune") {
    return NextResponse.redirect(new URL("/daily-fortune", request.url))
  }

  if (pathname === "/profile") {
    return NextResponse.redirect(MAIN_PROFILE)
  }

  if (pathname === "/profile/settings") {
    return NextResponse.redirect(new URL("/settings", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/fortune", "/fortune/", "/profile", "/profile/", "/profile/settings", "/profile/settings/"],
}
