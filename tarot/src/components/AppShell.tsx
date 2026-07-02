"use client"

import { usePathname } from "next/navigation"
import { AppShell as OraSageAppShell, type LocaleOption } from "@/lib/orasage-app-shell"
import { useLang, type Lang } from "@/lib/i18n/context"

const LANG_TO_LOCALE: Record<Lang, string> = {
  zh: "zh-CN",
  en: "en",
  pt: "pt-BR",
  es: "es",
}

const LOCALE_TO_LANG: Record<string, Lang> = {
  "zh-CN": "zh",
  en: "en",
  "pt-BR": "pt",
  es: "es",
}

const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "zh-CN", label: "中文" },
  { code: "en", label: "English" },
  { code: "pt-BR", label: "Português" },
  { code: "es", label: "Español" },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { lang, setLang } = useLang()
  const locale = LANG_TO_LOCALE[lang] ?? "zh-CN"

  return (
    <OraSageAppShell
      appId="tarot"
      locale={locale}
      locales={LOCALE_OPTIONS}
      onLocaleChange={(code) => {
        const next = LOCALE_TO_LANG[code]
        if (next) setLang(next)
      }}
      theme="dark"
      pathname={pathname}
    >
      {children}
    </OraSageAppShell>
  )
}
