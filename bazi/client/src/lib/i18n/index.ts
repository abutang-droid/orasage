import { createContext, useContext } from "react";
import { detectLocaleFromBrowser, toCoreLocale } from "@orasage/i18n";
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
  return toCoreLocale(detectLocaleFromBrowser()) as Locale;
}

const uiLoaders: Record<Locale, () => Promise<TranslationDict>> = {
  "zh-CN": () => import("./zh-CN").then((m) => m.default),
  "zh-TW": () => import("./zh-TW").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
  "pt-BR": () => import("./pt-BR").then((m) => m.default),
};

import zhCN from "./zh-CN";

export function loadUi(locale: Locale): Promise<TranslationDict> {
  return uiLoaders[locale]().catch(() => zhCN);
}

