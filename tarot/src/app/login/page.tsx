import { redirect } from "next/navigation"

// 强制动态渲染：否则 Next 可能在构建期把跳转目标当静态内容预渲染，
// 之后即便运行时环境变量变化也不会重新生效。
export const dynamic = "force-dynamic"

/**
 * tarot 自身不再维护独立的邮箱/密码登录表单 —— 统一跳转到
 * auth.orasage.com 登录，登录成功后通过共享的 orasage_token
 * cookie 桥接回本应用（见 src/lib/auth.ts 的 getParentBridgedUser）。
 * 未配置 AUTH_URL 时（独立部署场景）默认回退到访客模式首页。
 */
export default function LoginPage() {
  const authUrl = process.env.AUTH_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tarot.orasage.com"

  if (authUrl) {
    redirect(`${authUrl}/login?redirect=${encodeURIComponent(appUrl)}`)
  }

  redirect("/")
}
