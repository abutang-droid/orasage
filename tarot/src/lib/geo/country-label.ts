import { SEED_GEO_COUNTRIES } from '../../../../shared/tarot-geo-seed';
import type { Lang } from '@/lib/i18n/context';
import type { GeoCountry } from '@/lib/geo/types';

export function normalizeCountryCode(code: string | null | undefined): string {
  return (code ?? '').trim().toUpperCase();
}

/** 按当前语言解析国家/地区展示名（ISO 代码 → 中文名或英文名） */
export function resolveCountryLabel(
  code: string | null | undefined,
  countries: readonly GeoCountry[],
  lang: Lang,
): string {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return '';

  const found =
    countries.find((c) => normalizeCountryCode(c.code) === normalized) ??
    SEED_GEO_COUNTRIES.find((c) => c.code === normalized);

  if (!found) return '';
  return lang === 'zh' ? found.nameZh : found.nameEn;
}

export function resolveRegionLabel(
  code: string | null | undefined,
  regions: ReadonlyArray<{ code: string; nameZh: string; nameEn: string }>,
  lang: Lang,
): string {
  const normalized = (code ?? '').trim().toLowerCase();
  if (!normalized) return '';
  const found = regions.find((r) => r.code === normalized);
  if (!found) return '';
  return lang === 'zh' ? found.nameZh : found.nameEn;
}
