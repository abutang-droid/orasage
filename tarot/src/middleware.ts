import { NextRequest, NextResponse } from "next/server"
import { stampPromoChannelCookie } from "../../shared/promo-channel/index"

const MAIN_PROFILE = "https://orasage.com/zh-CN/profile"
const MAIN_SETTINGS = "https://orasage.com/zh-CN/profile/settings"
const MAIN_MERIT = "https://orasage.com/zh-CN/profile/merit"

const PORTAL_LOCALES = 'zh-CN|en|pt-BR|zh-TW|es|fr|de|ja|ko|vi|th|ar'

function redirectLocaleTemple(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/"
  const localeTemple = new RegExp(`^/(${PORTAL_LOCALES})/temple$`)
  if (localeTemple.test(pathname)) {
    return NextResponse.redirect(new URL("/temple", request.url))
  }
  return null
}

/** P0-4: `/en` → `/` with lang cookie (subdomain apps are not path-locale routed). */
function redirectLocaleRoot(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/"
  const m = pathname.match(new RegExp(`^/(${PORTAL_LOCALES})$`))
  if (!m) return null
  const locale = m[1]
  const url = request.nextUrl.clone()
  url.pathname = "/"
  url.searchParams.set("lang", locale)
  const res = NextResponse.redirect(url)
  res.cookies.set("orasage_locale", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  })
  return res
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/"
  const stamp = (response: NextResponse) => {
    stampPromoChannelCookie(request.nextUrl.hostname, request.nextUrl.searchParams, response.cookies)
    return response
  }

  const localeRoot = redirectLocaleRoot(request)
  if (localeRoot) return stamp(localeRoot)

  const localeTempleRedirect = redirectLocaleTemple(request)
  if (localeTempleRedirect) return stamp(localeTempleRedirect)

  if (pathname === "/fortune") {
    return stamp(NextResponse.redirect(new URL("/daily-fortune", request.url)))
  }

  if (pathname === "/profile") {
    return stamp(NextResponse.redirect(MAIN_PROFILE))
  }

  if (pathname === "/profile/merit") {
    return stamp(NextResponse.redirect(MAIN_MERIT))
  }

  if (pathname === "/profile/settings" || pathname === "/settings") {
    return stamp(NextResponse.redirect(MAIN_SETTINGS))
  }

  return stamp(NextResponse.next())
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
