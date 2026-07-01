"use client"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type Lang = "zh" | "pt" | "es" | "en"

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangCtx>({ lang: "zh", setLang: () => {} })

export function LangProvider({ children, initial = "zh" }: { children: ReactNode; initial?: Lang }) {
  const [lang, setLang] = useState<Lang>(initial)
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
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
