import { redirect } from "next/navigation"
import { ORASAGE_URLS } from "@/lib/orasage-app-shell/config"

// 强制动态渲染：否则 Next 可能在构建期把跳转目标当静态内容预渲染，
// 之后即便运行时环境变量变化也不会重新生效。
export const dynamic = "force-dynamic"

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
 * tarot 自身不再维护独立的邮箱/密码登录表单 —— 统一跳转到
 * auth 子域登录，登录成功后通过共享的 orasage_token
 * cookie 桥接回本应用（见 src/lib/auth.ts 的 getParentBridgedUser）。
 * 支持 ?return= 或 ?redirect= 指定登录后回跳路径（须为同域）。
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string; redirect?: string }>
}) {
  const params = await searchParams
  const authUrl =
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    ORASAGE_URLS.authLogin.replace(/\/login$/, "")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ORASAGE_URLS.tarot
  const returnTo = safeReturnUrl(params.return || params.redirect, appUrl)

  redirect(`${authUrl}/login?redirect=${encodeURIComponent(returnTo)}`)
}
