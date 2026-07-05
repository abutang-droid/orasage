import {
  mapCmsHeroContent,
  type CmsHeroRaw,
  type HeroDisplayMode,
  type MappedHeroContent,
} from '../../../shared/hero/map-cms-hero';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';
const CMS_PUBLIC_URL = process.env.CMS_PUBLIC_URL || 'https://admin.orasage.com/cms';

function heroApiUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api/cms/tarot-home-hero';
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

export async function fetchTarotHomeHero(): Promise<TarotHomeHeroContent | null> {
  try {
    const res = await fetch(heroApiUrl(), { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as CmsHeroRaw;
    return mapTarotHero(data);
  } catch {
    return null;
  }
}

export function fallbackTarotHomeHero(): TarotHomeHeroContent {
  return {
    enabled: true,
    eyebrow: '塔罗占卜',
    headline: '翻一张牌，看看今天怎么走',
    subtitle: '每日运势与三牌占卜，都在这里开始',
    displayMode: 'text',
    videoAutoplay: true,
  };
}
