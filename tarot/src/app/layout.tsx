import type { Metadata } from "next"
import "./globals.css"
import AppShell from "@/components/AppShell"
import { LangProvider } from "@/lib/i18n/context"
import { UserProvider } from "@/lib/user"

export const metadata: Metadata = {
  title: "Manto — 翻牌看运，拜神护体",
  description: "翻开你的牌，神灵在背面 · AI塔罗占卜 × 每日拜神 × 五行水晶",
  keywords: ["tarot", "塔罗", "占卜", "daily worship", "crystal", "spiritual", "web3"],
  openGraph: {
    title: "Manto — 翻牌看运，拜神护体",
    description: "翻开你的牌，神灵在背面",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0D0D0D" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <UserProvider>
          <LangProvider>
            <AppShell>
              {children}
            </AppShell>
          </LangProvider>
        </UserProvider>
      </body>
    </html>
  )
}
