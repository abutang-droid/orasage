"use client"
import { useEffect } from "react"
import { useLang } from "@/lib/i18n/context"
import { profileMeritUrlFromLang } from "@/lib/orasage-locale"
import { useHistoryCopy } from "@/lib/i18n/reading-copy"

/** 功德详情已迁入 main 门户 — 保留路由作重定向 */
export default function MeritRedirectPage() {
  const { lang } = useLang()
  const history = useHistoryCopy()

  useEffect(() => {
    window.location.replace(profileMeritUrlFromLang(lang))
  }, [lang])

  return (
    <div style={{ paddingTop: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
      {history.redirecting}
    </div>
  )
}
