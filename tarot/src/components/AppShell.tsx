"use client"

import { usePathname } from "next/navigation"
import { AppShell as OraSageAppShell } from "@/lib/orasage-app-shell"
import { useLang, type Lang } from "@/lib/i18n/context"

const LANG_TO_LOCALE: Record<Lang, string> = {
  zh: "zh-CN",
  en: "en",
  pt: "pt-BR",
  es: "es",
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { lang } = useLang()
  const locale = LANG_TO_LOCALE[lang] ?? "zh-CN"

  return (
    <OraSageAppShell
      appId="tarot"
      locale={locale}
      theme="light"
      pathname={pathname}
    >
      {children}
    </OraSageAppShell>
  )
}
