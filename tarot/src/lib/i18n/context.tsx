"use client"

/**
 * Tarot i18n — adapter over the unified @orasage/i18n runtime.
 * Copy files keep the short-code `Lang` API (zh/en/pt/es); locale detection,
 * switching and the cross-subdomain cookie contract come from the shared
 * package (fixes the old "always starts in zh" cookie gap).
 */

import { useCallback, type ReactNode } from "react"
import {
  localeFromTarotLang,
  normalizeLocale,
  tarotLangFromLocale,
  toCoreLocale,
  type TarotLang,
} from "@orasage/i18n"
import { I18nProvider, useI18n } from "@orasage/i18n/react"

export type Lang = TarotLang

/** Tarot — phase 1 uses unified core locale mapping (es → en). */
function mapTarotLocale(input: string): string {
  return toCoreLocale(normalizeLocale(input));
}

export function LangProvider({ children, initial }: { children: ReactNode; initial?: Lang }) {
  return (
    <I18nProvider
      initialLocale={initial ? localeFromTarotLang(initial) : undefined}
      mapLocale={mapTarotLocale}
    >
      {children}
    </I18nProvider>
  )
}

export function useLang() {
  const { locale, setLocale } = useI18n()
  const lang = tarotLangFromLocale(locale)
  const setLang = useCallback(
    (l: Lang) => setLocale(localeFromTarotLang(l)),
    [setLocale],
  )
  return { lang, setLang }
}

/** Full BCP 47 locale for the app shell / cross-app links. */
export function useTarotLocale() {
  const { locale, setLocale } = useI18n()
  return { locale, setLocale }
}

/** Return the card name for the current language. */
export function useCardName() {
  const { lang } = useLang()
  return useCallback((card: { name: string; nameEn: string; namePt: string; nameEs: string }) => {
    switch (lang) {
      case "pt": return card.namePt
      case "es": return card.nameEs
      case "en": return card.nameEn
      default:   return card.name
    }
  }, [lang])
}

/** Translate a fixed string map (for UI labels, not card names). */
export function useT() {
  const { lang } = useLang()
  return useCallback((map: Partial<Record<Lang, string>>, fallback: string) => {
    return map[lang] || fallback
  }, [lang])
}
