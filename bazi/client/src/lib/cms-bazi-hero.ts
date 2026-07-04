import {
  mapCmsHeroContent,
  type CmsHeroRaw,
  type HeroDisplayMode,
  type MappedHeroContent,
} from '../../../shared/hero/map-cms-hero';

const CMS_INTERNAL_URL =
  import.meta.env.VITE_CMS_URL || import.meta.env.VITE_CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';
const CMS_PUBLIC_URL =
  import.meta.env.VITE_CMS_PUBLIC_URL || 'https://admin.orasage.com/cms';

/** 浏览器走同源代理，避免跨域 CORS 导致拉取失败后误用 enabled:true 的 fallback */
function heroApiUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api/cms/bazi-home-hero';
  }
  return `${CMS_INTERNAL_URL}/api/globals/bazi-home-hero?depth=1`;
}

export type BaziHeroDisplayMode = HeroDisplayMode;
export type BaziHomeHeroContent = MappedHeroContent;

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

function mapBaziHero(data: CmsHeroRaw): BaziHomeHeroContent | null {
  return mapCmsHeroContent(data, resolveMediaUrl);
}

export async function fetchBaziHomeHero(): Promise<BaziHomeHeroContent | null> {
  try {
    const res = await fetch(heroApiUrl(), {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CmsHeroRaw;
    return mapBaziHero(data);
  } catch {
    return null;
  }
}

export function fallbackBaziHomeHero(messages: {
  eyebrow: string;
  title: string;
  subtitle: string;
}): BaziHomeHeroContent {
  return {
    enabled: true,
    eyebrow: messages.eyebrow,
    headline: messages.title,
    subtitle: messages.subtitle,
    displayMode: 'text',
    videoAutoplay: true,
  };
}
