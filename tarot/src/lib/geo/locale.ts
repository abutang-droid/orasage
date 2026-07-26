import type { Lang } from '@/lib/i18n/context';

/** Geo entities only ship zh/en — non-zh UIs use English. */
export function geoLocalizedName(
  item: { nameZh: string; nameEn: string } | null | undefined,
  lang: Lang,
  fallback = '',
): string {
  if (!item) return fallback;
  if (lang === 'zh') return (item.nameZh || item.nameEn || fallback).trim();
  return (item.nameEn || item.nameZh || fallback).trim();
}
