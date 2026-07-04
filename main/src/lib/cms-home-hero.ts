import {
  mapCmsHeroContent,
  type CmsHeroRaw,
  type HeroDisplayMode,
  type MappedHeroContent,
} from '../../../shared/hero/map-cms-hero';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';
const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'https://admin.orasage.com/cms';

export type HomeHeroDisplayMode = HeroDisplayMode;
export type HomeHeroContent = MappedHeroContent;

type CmsMedia = {
  url?: string | null;
  alt?: string | null;
  mimeType?: string | null;
};

function resolveCmsMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${CMS_PUBLIC_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function resolveMediaUrl(media: CmsMedia | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  return resolveCmsMediaUrl(media.url);
}

function mapHomeHero(data: CmsHeroRaw): HomeHeroContent | null {
  return mapCmsHeroContent(data, resolveMediaUrl);
}

export async function fetchHomeHero(_locale: string): Promise<HomeHeroContent | null> {
  try {
    const res = await fetch(`${CMS_INTERNAL_URL}/api/globals/home-hero?depth=1`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CmsHeroRaw;
    return mapHomeHero(data);
  } catch {
    return null;
  }
}

export function fallbackHomeHero(messages: {
  hero: { title: string; subtitle: string };
}): HomeHeroContent {
  return {
    enabled: true,
    eyebrow: 'OraSage',
    headline: messages.hero.title,
    subtitle: messages.hero.subtitle,
    displayMode: 'text',
    videoAutoplay: true,
  };
}
