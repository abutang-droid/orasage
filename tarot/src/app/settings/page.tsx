"use client"

import { useEffect } from "react"
import { useRedirectCopy } from "@/lib/i18n/feature-copy"
import { useLang } from "@/lib/i18n/context"
import { profileSettingsUrlFromLang } from "@/lib/orasage-locale"

/** 应用设置已迁至 main 门户「我的 → 设置」 */
export default function SettingsRedirectPage() {
  const { lang } = useLang()
  const copy = useRedirectCopy()

  useEffect(() => {
    window.location.replace(profileSettingsUrlFromLang(lang))
  }, [lang])

  return (
    <p style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
      {copy.settings}
    </p>
  )
}
