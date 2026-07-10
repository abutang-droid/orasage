"use client"

import { useEffect } from "react"
import { useRedirectCopy } from "@/lib/i18n/feature-copy"
import { useLang } from "@/lib/i18n/context"
import { profileUrlFromLang } from "@/lib/orasage-locale"

/** 统一用户中心在 main 门户 — 本页仅作跳转 */
export default function ProfileRedirectPage() {
  const { lang } = useLang()
  const copy = useRedirectCopy()

  useEffect(() => {
    window.location.replace(profileUrlFromLang(lang))
  }, [lang])

  return (
    <p style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
      {copy.profile}
    </p>
  )
}
