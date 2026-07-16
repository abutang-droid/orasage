/** 水晶专题素材内容（v1 占位填充，运营后台可维护） */

import {
  CRYSTAL_CONTENT_BY_LOCALE,
  normalizeCrystalLocale,
  type CrystalContentLocale,
} from './content-i18n';

export type CrystalContentEntry = {
  /** 情感短语，如「生长之境」 */
  tagline: string;
  /** 能量故事（1–2 段） */
  story: string;
  /** 能量关键词（chips 展示） */
  keywords: string[];
  /** 佩戴收益 bullets */
  benefits: string[];
  /** 佩戴仪式 / 场景一句话 */
  ritual: string;
  /** SKU 切换下方补充说明（选填，后台不配则前台不展示） */
  packNote: string;
};

export type CrystalContentMap = Record<string, CrystalContentEntry>;

/** @deprecated Prefer getDefaultCrystalContent(locale); kept as zh-CN alias for admin/auth merge. */
export const DEFAULT_CRYSTAL_CONTENT: CrystalContentMap =
  CRYSTAL_CONTENT_BY_LOCALE['zh-CN'];

export function getDefaultCrystalContent(
  locale: string | null | undefined = 'zh-CN',
): CrystalContentMap {
  return CRYSTAL_CONTENT_BY_LOCALE[normalizeCrystalLocale(locale)];
}

/**
 * Merge CMS/auth overrides onto locale defaults.
 * Non–zh-CN locales ignore Chinese CMS overrides so en/pt-BR/zh-TW stay language-consistent.
 */
export function mergeCrystalContent(
  saved: Partial<CrystalContentMap> | null | undefined,
  locale: string | null | undefined = 'zh-CN',
): CrystalContentMap {
  const loc = normalizeCrystalLocale(locale);
  const defaults = CRYSTAL_CONTENT_BY_LOCALE[loc];
  const applySaved = loc === 'zh-CN';
  const merged: CrystalContentMap = {};
  for (const [sku, base] of Object.entries(defaults)) {
    const entry = applySaved ? saved?.[sku] : undefined;
    merged[sku] = {
      tagline: entry?.tagline?.trim() || base.tagline,
      story: entry?.story?.trim() || base.story,
      keywords: entry?.keywords?.length ? entry.keywords : base.keywords,
      benefits: entry?.benefits?.length ? entry.benefits : base.benefits,
      ritual: entry?.ritual?.trim() || base.ritual,
      packNote: entry?.packNote?.trim() ?? '',
    };
  }
  return merged;
}

export type { CrystalContentLocale };
export {
  CRYSTAL_CONTENT_BY_LOCALE,
  CRYSTAL_ELEMENT_LABELS,
  normalizeCrystalLocale,
} from './content-i18n';
