import { NextRequest, NextResponse } from "next/server"
import { apexFromHostname, normalizeSiteApex } from "@/lib/orasage-app-shell/config"

function siteApex(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_APEX || process.env.SITE_APEX
  if (fromEnv) return normalizeSiteApex(fromEnv)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.hostname
  return apexFromHostname(host) || "orasage.com"
}

function mainUrls(request: NextRequest) {
  const apex = siteApex(request)
  const main = `https://${apex}`
  return {
    profile: `${main}/zh-CN/profile`,
    settings: `${main}/zh-CN/profile/settings`,
    merit: `${main}/zh-CN/profile/merit`,
  }
}

const PORTAL_LOCALES = 'zh-CN|en|pt-BR|zh-TW|es|fr|de|ja|ko|vi|th|ar'

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
  const urls = mainUrls(request)

  const localeTempleRedirect = redirectLocaleTemple(request)
  if (localeTempleRedirect) return localeTempleRedirect

  if (pathname === "/fortune") {
    return NextResponse.redirect(new URL("/daily-fortune", request.url))
  }

  if (pathname === "/profile") {
    return NextResponse.redirect(urls.profile)
  }

  if (pathname === "/profile/merit") {
    return NextResponse.redirect(urls.merit)
  }

  if (pathname === "/profile/settings" || pathname === "/settings") {
    return NextResponse.redirect(urls.settings)
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
