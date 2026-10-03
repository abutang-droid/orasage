/**
 * 母品牌字标与署名 — 见 docs/design-system/OraSage-Brand-Spec.md §1.0
 *
 * 中文 locale：双品牌（主海棠未眠 / 辅 OraSage）
 * 其它 locale：仅 OraSage，不用汉字
 */

export const LATIN_BRAND = 'OraSage';
export const ZH_PRIMARY_BRAND = '海棠未眠';

export function isChineseLocale(locale?: string | null): boolean {
  const loc = (locale || '').toLowerCase().replace('_', '-');
  return loc === 'zh' || loc.startsWith('zh-');
}

/** 顶栏主字标 / 标题后缀 */
export function siteDisplayName(locale?: string | null): string {
  return isChineseLocale(locale) ? ZH_PRIMARY_BRAND : LATIN_BRAND;
}

/** 中文版辅名；其它语言不出现第二品牌 */
export function siteAuxName(locale?: string | null): string | null {
  return isChineseLocale(locale) ? LATIN_BRAND : null;
}

/** 正式署名：海棠未眠 OraSage / OraSage */
export function siteSignature(locale?: string | null): string {
  return isChineseLocale(locale) ? `${ZH_PRIMARY_BRAND} ${LATIN_BRAND}` : LATIN_BRAND;
}

export function titleTemplate(locale?: string | null): string {
  return `%s | ${siteDisplayName(locale)}`;
}

export function withSiteTitle(pageTitle: string, locale?: string | null): string {
  const name = siteDisplayName(locale);
  const stripped = pageTitle
    .replace(/\s*[|·—–-]\s*OraSage(?:\s+Crystal Shop)?\s*$/i, '')
    .replace(/\s*[|·—–-]\s*海棠未眠(?:\s+OraSage)?\s*$/, '')
    .trim();
  if (stripped && stripped !== pageTitle) {
    return `${stripped} | ${name}`;
  }
  if (/OraSage/i.test(pageTitle) || pageTitle.includes(ZH_PRIMARY_BRAND)) {
    return pageTitle;
  }
  return `${pageTitle} | ${name}`;
}

export function copyrightLine(locale?: string | null, year = 2026): string {
  const loc = (locale || '').toLowerCase().replace('_', '-');
  if (isChineseLocale(locale)) {
    if (loc.includes('tw') || loc.includes('hk') || loc.includes('hant')) {
      return `© ${year} ${ZH_PRIMARY_BRAND} ${LATIN_BRAND}. 保留所有權利。`;
    }
    return `© ${year} ${ZH_PRIMARY_BRAND} ${LATIN_BRAND}. 保留所有权利。`;
  }
  if (loc.startsWith('pt')) {
    return `© ${year} ${LATIN_BRAND}. Todos os direitos reservados.`;
  }
  return `© ${year} ${LATIN_BRAND}. All rights reserved.`;
}

/** CMS / 首页 eyebrow：中文主名，其它语言 OraSage */
export function heroEyebrow(locale?: string | null): string {
  return siteDisplayName(locale);
}

export function localizeBrandEyebrow(eyebrow: string | null | undefined, locale?: string | null): string {
  const raw = (eyebrow ?? '').trim();
  if (isChineseLocale(locale)) {
    if (!raw || raw === LATIN_BRAND || /^orasage$/i.test(raw)) return ZH_PRIMARY_BRAND;
    return raw;
  }
  if (!raw || raw.includes(ZH_PRIMARY_BRAND) || /[\u3400-\u9fff]/.test(raw)) {
    return LATIN_BRAND;
  }
  return raw;
}

export function motherBrandLockupHtml(locale?: string | null): string {
  const primary = siteDisplayName(locale);
  const aux = siteAuxName(locale);
  const script = isChineseLocale(locale) ? 'zh' : 'latin';
  const auxHtml = aux ? `<span class="orasage-brand-lockup-aux">${aux}</span>` : '';
  return `<span class="orasage-brand-lockup" aria-label="${siteSignature(locale)}"><span class="orasage-brand-lockup-primary" data-script="${script}">${primary}</span>${auxHtml}</span>`;
}
