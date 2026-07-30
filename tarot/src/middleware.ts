import { NextRequest, NextResponse } from "next/server"
import {
  CORE_LOCALES,
  LOCALE_COOKIE,
  LOCALE_OVERRIDE_COOKIE,
  normalizeLocale,
} from "@orasage/i18n"

const PORTAL_LOCALES = 'zh-CN|en|pt-BR|zh-TW|es|fr|de|ja|ko|vi|th|ar'

function redirectLocaleTemple(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/"
  const localeTemple = new RegExp(`^/(${PORTAL_LOCALES})/temple$`)
  const match = pathname.match(localeTemple)
  if (match) {
    const url = new URL("/temple", request.url)
    url.searchParams.set("lang", match[1])
    return NextResponse.redirect(url)
  }
  return null
}

function resolveLocale(request: NextRequest): string {
  const fromQuery =
    request.nextUrl.searchParams.get("lang") ??
    request.nextUrl.searchParams.get("locale")
  if (fromQuery) {
    const normalized = normalizeLocale(fromQuery)
    if ((CORE_LOCALES as readonly string[]).includes(normalized)) return normalized
  }
  const cookie =
    request.cookies.get(LOCALE_OVERRIDE_COOKIE)?.value ??
    request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie) {
    try {
      return normalizeLocale(decodeURIComponent(cookie))
    } catch {
      return normalizeLocale(cookie)
    }
  }
  return "zh-CN"
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/"
  const locale = resolveLocale(request)

  const localeTempleRedirect = redirectLocaleTemple(request)
  if (localeTempleRedirect) return localeTempleRedirect

  if (pathname === "/fortune") {
    return NextResponse.redirect(new URL("/daily-fortune", request.url))
  }

  if (pathname === "/profile") {
    return NextResponse.redirect(`https://orasage.com/${locale}/profile`)
  }

  if (pathname === "/profile/merit") {
    return NextResponse.redirect(`https://orasage.com/${locale}/profile/merit`)
  }

  if (pathname === "/profile/settings" || pathname === "/settings") {
    return NextResponse.redirect(`https://orasage.com/${locale}/profile/settings`)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-orasage-locale", locale)
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const queryLang =
    request.nextUrl.searchParams.get("lang") ??
    request.nextUrl.searchParams.get("locale")
  if (queryLang) {
    const normalized = normalizeLocale(queryLang)
    if ((CORE_LOCALES as readonly string[]).includes(normalized)) {
      response.cookies.set(LOCALE_COOKIE, normalized, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        domain: ".orasage.com",
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
}
