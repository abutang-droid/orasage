import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';
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
function cmsPublicUrl() {
  return process.env.CMS_PUBLIC_URL || process.env.NEXT_PUBLIC_CMS_URL || `https://admin.${ORASAGE_URLS.main.replace(/^https?:\/\//, '')}/cms`;
}
const CMS_PUBLIC_URL = cmsPublicUrl();

function heroApiUrl(lang?: Lang): string {
  if (typeof window !== 'undefined') {
    const params = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    return `/api/cms/tarot-home-hero${params}`;
  }
  return `${CMS_INTERNAL_URL}/api/globals/tarot-home-hero?depth=1`;
}

/**
 * CMS Hero globals are Chinese-only today. For en/pt/es, keep media/displayMode
 * from CMS but swap eyebrow/headline/subtitle to the UI locale dictionary.
 */
export function applyTarotHeroLocaleCopy(
  hero: TarotHomeHeroContent,
  lang: Lang,
): TarotHomeHeroContent {
  if (!hero.enabled || lang === 'zh') return hero;
  const localized = fallbackTarotHomeHeroContent(lang);
  return {
    ...hero,
    eyebrow: localized.eyebrow,
    headline: localized.headline,
    subtitle: localized.subtitle,
  };
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
  const resolved = await resolveHeroWithFallback(mapped, fallbackTarotHomeHero(lang), {
    publicCmsBase: CMS_PUBLIC_URL,
    internalCmsBase: CMS_INTERNAL_URL,
  });
  return applyTarotHeroLocaleCopy(resolved, lang);
}

export async function fetchTarotHomeHero(lang: Lang = 'zh'): Promise<TarotHomeHeroContent> {
  try {
    const res = await fetch(heroApiUrl(lang), { cache: 'no-store' });
    if (!res.ok) return fallbackTarotHomeHero(lang);
    const data = (await res.json()) as TarotHomeHeroContent | CmsHeroRaw;
    if (data && typeof data === 'object' && 'displayMode' in data && 'enabled' in data) {
      // API already localized when called with ?lang=
      return applyTarotHeroLocaleCopy(data as TarotHomeHeroContent, lang);
    }
    return resolveTarotHeroFromRaw(data as CmsHeroRaw, lang);
  } catch {
    return fallbackTarotHomeHero(lang);
  }
}

export function fallbackTarotHomeHero(lang: Lang = 'zh'): TarotHomeHeroContent {
  return fallbackTarotHomeHeroContent(lang);
}
