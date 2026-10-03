/**
 * Bazi i18n — adapter over the unified @orasage/i18n runtime.
 * Dictionaries stay app-local (lazy-loaded); detection / switching /
 * cookie contract come from the shared package.
 */

import type { CoreLocale } from "@orasage/i18n";
import { LOCALE_LABELS as SHARED_LABELS } from "@orasage/i18n";
import { useI18n, type Dictionaries } from "@orasage/i18n/react";
import { useCallback } from "react";
import { termData } from "./terms";
import zhCN from "./zh-CN";

export type Locale = CoreLocale;

export const LOCALE_LABELS: Record<Locale, string> = {
  "zh-CN": SHARED_LABELS["zh-CN"],
  en: SHARED_LABELS.en,
  "pt-BR": SHARED_LABELS["pt-BR"],
};

export type TranslationDict = Record<string, string>;

export const DICTIONARIES: Dictionaries = {
  "zh-CN": zhCN,
  en: () => import("./en").then((m) => m.default),
  "pt-BR": () => import("./pt-BR").then((m) => m.default),
};

export function useT() {
  const { locale, messages } = useI18n();
  const t = useCallback(
    (key: string, fallback?: string) => messages[key] ?? fallback ?? key,
    [messages],
  );
  const term = useCallback((key: string) => {
    const m = termData[key];
    if (!m) return key;
    return m[locale as Locale] ?? m["zh-CN"] ?? key;
  }, [locale]);
  return { t, term, locale: locale as Locale };
}
