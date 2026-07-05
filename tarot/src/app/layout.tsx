import type { Metadata } from "next"
import "./globals.css"
import AppShell from "@/components/AppShell"
import { ReadingSyncBackfill } from "@/components/auth/ReadingSyncBackfill"
import { LangProvider } from "@/lib/i18n/context"
import { UserProvider } from "@/lib/user"
import { buildOrasageMetadata, ORASAGE_URLS } from "@/lib/orasage-seo"

const PAGE_TITLE = "塔罗占卜 · 每日拜神"
const PAGE_DESCRIPTION = "翻开你的牌，神灵在背面 · AI塔罗占卜 × 每日拜神 × 五行水晶"

export const metadata: Metadata = buildOrasageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: ["OraSage", "tarot", "塔罗", "占卜", "daily worship", "crystal", "spiritual", "命理"],
  metadataBase: new URL(ORASAGE_URLS.tarot),
  canonical: "/",
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: ORASAGE_URLS.tarot,
    locale: "zh_CN",
  },
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FAFAF8" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <UserProvider>
          <LangProvider>
            <ReadingSyncBackfill />
            <AppShell>
              {children}
            </AppShell>
          </LangProvider>
        </UserProvider>
      </body>
    </html>
  )
}
