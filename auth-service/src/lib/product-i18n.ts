import { detectShopLocale } from "../../../shared/shop-locale/index.ts";

export type LocalizedMap = Record<string, string> | null | undefined;

/** Pick localized string: exact locale → zh-CN → en → base column */
export function pickLocalized(map: LocalizedMap, locale: string, fallback: string): string {
  if (!map || typeof map !== "object") return fallback;
  const norm = detectShopLocale({ queryLocale: locale });
  if (map[norm]) return map[norm];
  if (map["zh-CN"]) return map["zh-CN"];
  if (map.en) return map.en;
  return fallback;
}
