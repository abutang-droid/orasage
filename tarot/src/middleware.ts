import { NextRequest, NextResponse } from "next/server"

const MAIN_PROFILE = "https://orasage.com/zh-CN/profile"
const MAIN_SETTINGS = "https://orasage.com/zh-CN/profile/settings"
const MAIN_MERIT = "https://orasage.com/zh-CN/profile/merit"

const PORTAL_LOCALES = 'zh-CN|en|pt-BR|zh-TW|es|fr|de|ja|ko|vi|th|ar';

function redirectLocaleTemple(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/"
  const localeTemple = new RegExp(`^/(${PORTAL_LOCALES})/temple$`)
  if (localeTemple.test(pathname)) {
    return NextResponse.redirect(new URL("/temple", request.url))
  }
  return null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/"

  const localeTempleRedirect = redirectLocaleTemple(request)
  if (localeTempleRedirect) return localeTempleRedirect

  if (pathname === "/fortune") {
    return NextResponse.redirect(new URL("/daily-fortune", request.url))
  }

  if (pathname === "/profile") {
    return NextResponse.redirect(MAIN_PROFILE)
  }

  if (pathname === "/profile/merit") {
    return NextResponse.redirect(MAIN_MERIT)
  }

  if (pathname === "/profile/settings" || pathname === "/settings") {
    return NextResponse.redirect(MAIN_SETTINGS)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/fortune",
    "/fortune/",
    "/profile",
    "/profile/",
    "/profile/merit",
    "/profile/merit/",
    "/profile/settings",
    "/profile/settings/",
    "/settings",
    "/settings/",
    "/:locale/temple",
    "/:locale/temple/",
  ],
}
