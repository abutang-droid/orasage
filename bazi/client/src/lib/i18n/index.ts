import { createContext, useContext } from "react";
import { termData } from "./terms";

export type Locale = "zh-CN" | "zh-TW" | "en" | "pt-BR";

export const LOCALE_LABELS: Record<Locale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  "pt-BR": "Português (BR)",
};

export type TranslationDict = Record<string, string>;

export interface I18nPack {
  locale: Locale;
  ui: TranslationDict;
}

export const LocaleContext = createContext<I18nPack>({
  locale: "zh-CN",
  ui: {},
});

export function useT() {
  const pack = useContext(LocaleContext);
  return {
    t: (key: string, fallback?: string) => pack.ui[key] ?? fallback ?? key,
    term: (key: string) => {
      const m = termData[key];
      if (!m) return key;
      return m[pack.locale] ?? m["zh-CN"] ?? key;
    },
    locale: pack.locale,
  };
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "zh-CN";
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang");
  if (langParam === "zh-TW" || langParam === "en" || langParam === "pt-BR") {
    return langParam;
  }
  if (langParam === "zh-CN" || langParam === "zh") return "zh-CN";

  const navLang = navigator.language?.toLowerCase() || "";
  if (navLang.startsWith("zh-tw") || navLang.startsWith("zh-hk")) return "zh-TW";
  if (navLang.startsWith("zh")) return "zh-CN";
  if (navLang.startsWith("pt")) return "pt-BR";
  if (navLang.startsWith("en")) return "en";

  return "zh-CN";
}

const uiLoaders: Record<Locale, () => Promise<TranslationDict>> = {
  "zh-CN": () => import("./zh-CN").then((m) => m.default),
  "zh-TW": () => import("./zh-TW").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
  "pt-BR": () => import("./pt-BR").then((m) => m.default),
};

export function loadUi(locale: Locale): Promise<TranslationDict> {
  return uiLoaders[locale]();
}

