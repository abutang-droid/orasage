import type { Metadata } from "next"
import "./globals.css"
import AppShell from "@/components/AppShell"
import { ReadingSyncBackfill } from "@/components/auth/ReadingSyncBackfill"
import { HtmlLangSync } from "@/components/i18n/HtmlLangSync"
import { LangProvider } from "@/lib/i18n/context"
import { resolveServerLang } from "@/lib/i18n/request-lang"
import { siteMetadataForLang } from "@/lib/i18n/site-metadata"
import { UserProvider } from "@/lib/user"
import { buildOrasageMetadata, ORASAGE_URLS } from "@/lib/orasage-seo"
import { localeFromTarotLang } from "@orasage/i18n"

export async function generateMetadata(): Promise<Metadata> {
  const lang = await resolveServerLang()
  const meta = siteMetadataForLang(lang)

  return buildOrasageMetadata({
    title: meta.title,
    description: meta.description,
    keywords: ["OraSage", "tarot", "塔罗", "占卜", "daily worship", "crystal", "spiritual", "命理"],
    metadataBase: new URL(ORASAGE_URLS.tarot),
    canonical: "/",
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: ORASAGE_URLS.tarot,
      locale: meta.locale,
    },
    ogImage: `${ORASAGE_URLS.tarot}/og.png`,
  })
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await resolveServerLang()
  const htmlLang = localeFromTarotLang(lang)

  return (
    <html lang={htmlLang}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FAFAF8" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <UserProvider>
          <LangProvider initial={lang}>
            <HtmlLangSync />
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
