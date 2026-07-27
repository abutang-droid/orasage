import { redirect } from "next/navigation"
import { ORASAGE_URLS } from "@/lib/orasage-app-shell/config"

// 强制动态渲染：否则 Next 可能在构建期把跳转目标当静态内容预渲染，
// 之后即便运行时环境变量变化也不会重新生效。
export const dynamic = "force-dynamic"

function worldAuthRequired(): boolean {
  const v = (process.env.WORLD_AUTH_REQUIRED || process.env.NEXT_PUBLIC_WORLD_AUTH_REQUIRED || "")
    .trim()
    .toLowerCase()
  return v === "true" || v === "1" || v === "yes"
}

function safeReturnUrl(candidate: string | undefined, appUrl: string): string {
  if (!candidate?.trim()) return appUrl
  try {
    const parsed = new URL(candidate)
    const app = new URL(appUrl)
    if (parsed.origin === app.origin) return parsed.toString()
  } catch {
    /* fall through */
  }
  return appUrl
}

/**
 * When World auth is required, stay on tarot (registered Mini App origin)
 * so MiniKit.walletAuth runs in-context. Otherwise bridge to auth-service.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; redirect?: string }>
}) {
  const params = await searchParams
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ORASAGE_URLS.tarot
  const returnTo = safeReturnUrl(params.return || params.redirect, appUrl)

  if (worldAuthRequired()) {
    const dest = new URL(returnTo, appUrl)
    dest.searchParams.set("world_login", "1")
    redirect(`${dest.pathname}${dest.search}`)
  }

  const authUrl =
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    ORASAGE_URLS.authLogin.replace(/\/login$/, "")

  redirect(`${authUrl}/login?redirect=${encodeURIComponent(returnTo)}`)
}
