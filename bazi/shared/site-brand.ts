/**
 * 报告页母品牌字标 — 对齐 docs/design-system/OraSage-Brand-Spec.md §1.0
 * 中文：主海棠未眠 / 辅 OraSage；其它语言：仅 OraSage
 */

export const LATIN_BRAND = "OraSage";
export const ZH_PRIMARY_BRAND = "海棠未眠";

export function isChineseLocale(locale?: string | null): boolean {
  const loc = (locale || "").toLowerCase().replace("_", "-");
  return loc === "zh" || loc.startsWith("zh-");
}

export function siteDisplayName(locale?: string | null): string {
  return isChineseLocale(locale) ? ZH_PRIMARY_BRAND : LATIN_BRAND;
}

export function siteAuxName(locale?: string | null): string | null {
  return isChineseLocale(locale) ? LATIN_BRAND : null;
}

export function siteSignature(locale?: string | null): string {
  return isChineseLocale(locale) ? `${ZH_PRIMARY_BRAND} ${LATIN_BRAND}` : LATIN_BRAND;
}

export function copyrightLine(locale?: string | null, year = new Date().getFullYear()): string {
  if (isChineseLocale(locale)) {
    return `© ${year} ${ZH_PRIMARY_BRAND} ${LATIN_BRAND}`;
  }
  return `© ${year} ${LATIN_BRAND}`;
}

/** 顶栏 / 页脚字标 HTML（主名 + 可选辅名） */
export function brandLockupHtml(locale?: string | null): string {
  const primary = siteDisplayName(locale);
  const aux = siteAuxName(locale);
  const script = isChineseLocale(locale) ? "zh" : "latin";
  const auxHtml = aux
    ? `<span class="brand-lockup-aux">${aux}</span>`
    : "";
  return `<span class="brand-lockup" aria-label="${siteSignature(locale)}"><span class="brand-lockup-primary" data-script="${script}">${primary}</span>${auxHtml}</span>`;
}
