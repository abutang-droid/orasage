"use client"

import { useT, useLang, type Lang } from "@/lib/i18n/context"
import { mainPortalUrl } from "@/lib/orasage-app-shell/config"

const LANG_TO_LOCALE: Record<Lang, string> = {
  zh: "zh-CN",
  en: "en",
  pt: "pt-BR",
  es: "es",
}

const FOOTER_COPY = {
  copyright: {
    zh: "© 2026 OraSage. 保留所有权利。",
    en: "© 2026 OraSage. All rights reserved.",
    pt: "© 2026 OraSage. Todos os direitos reservados.",
    es: "© 2026 OraSage. Todos los derechos reservados.",
  },
  privacy: {
    zh: "隐私政策",
    en: "Privacy Policy",
    pt: "Política de Privacidade",
    es: "Política de Privacidad",
  },
  terms: {
    zh: "服务条款",
    en: "Terms of Service",
    pt: "Termos de Serviço",
    es: "Términos de Servicio",
  },
}

/** PC 页脚 — 与 main 门户首页一致（仅桌面显示） */
export function PortalFooter() {
  const t = useT()
  const { lang } = useLang()
  const locale = LANG_TO_LOCALE[lang] ?? "zh-CN"
  const base = mainPortalUrl(locale)

  return (
    <footer className="orasage-portal-footer safe-bottom mt-auto hidden lg:block">
      <div className="orasage-portal-footer-inner">
        <p className="orasage-portal-footer-copy">{t(FOOTER_COPY.copyright, FOOTER_COPY.copyright.zh)}</p>
        <div className="orasage-portal-footer-links">
          <a href={`${base}/privacy`} className="orasage-portal-footer-link">
            {t(FOOTER_COPY.privacy, FOOTER_COPY.privacy.zh)}
          </a>
          <a href={`${base}/terms`} className="orasage-portal-footer-link">
            {t(FOOTER_COPY.terms, FOOTER_COPY.terms.zh)}
          </a>
        </div>
      </div>
    </footer>
  )
}
