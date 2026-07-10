import {
  mapCmsHeroContent,
  type CmsHeroRaw,
  type HeroDisplayMode,
  type MappedHeroContent,
} from '../../../shared/hero/map-cms-hero';
import { resolveHeroWithFallback } from '../../../shared/hero/resolve-hero';
import type { Lang } from '@/lib/i18n/context';
import { fallbackTarotHomeHeroContent } from '@/lib/i18n/reading-copy';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';
const CMS_PUBLIC_URL = process.env.CMS_PUBLIC_URL || 'https://admin.orasage.com/cms';

function heroApiUrl(lang?: Lang): string {
  if (typeof window !== 'undefined') {
    const params = lang && lang !== 'zh' ? `?lang=${lang}` : '';
    return `/api/cms/tarot-home-hero${params}`;
  }
  return `${CMS_INTERNAL_URL}/api/globals/tarot-home-hero?depth=1`;
}

export type TarotHeroDisplayMode = HeroDisplayMode;
export type TarotHomeHeroContent = MappedHeroContent;

type CmsMedia = {
  url?: string | null;
  alt?: string | null;
  mimeType?: string | null;
};

function resolveMediaUrl(media: CmsMedia | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  const url = media.url;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${CMS_PUBLIC_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function mapTarotHero(data: CmsHeroRaw): TarotHomeHeroContent | null {
  return mapCmsHeroContent(data, resolveMediaUrl);
}

export async function resolveTarotHeroFromRaw(
  data: CmsHeroRaw,
  lang: Lang = 'zh',
): Promise<TarotHomeHeroContent> {
  const mapped = mapTarotHero(data);
  return resolveHeroWithFallback(mapped, fallbackTarotHomeHero(lang), {
    publicCmsBase: CMS_PUBLIC_URL,
    internalCmsBase: CMS_INTERNAL_URL,
  });
}

export async function fetchTarotHomeHero(lang: Lang = 'zh'): Promise<TarotHomeHeroContent> {
  try {
    const res = await fetch(heroApiUrl(lang), { cache: 'no-store' });
    if (!res.ok) return fallbackTarotHomeHero(lang);
    const data = (await res.json()) as TarotHomeHeroContent | CmsHeroRaw;
    if (data && typeof data === 'object' && 'displayMode' in data && 'enabled' in data) {
      return data as TarotHomeHeroContent;
    }
    return resolveTarotHeroFromRaw(data as CmsHeroRaw, lang);
  } catch {
    return fallbackTarotHomeHero(lang);
  }
}

export function fallbackTarotHomeHero(lang: Lang = 'zh'): TarotHomeHeroContent {
  return fallbackTarotHomeHeroContent(lang);
}
