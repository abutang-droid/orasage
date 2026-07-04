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

export type ShopHeroDisplayMode = HeroDisplayMode;
export type ShopHomeHeroContent = MappedHeroContent;

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

function mapShopHero(data: CmsHeroRaw): ShopHomeHeroContent | null {
  return mapCmsHeroContent(data, resolveMediaUrl);
}

export async function fetchShopHomeHero(): Promise<ShopHomeHeroContent | null> {
  try {
    const res = await fetch(`${CMS_INTERNAL_URL}/api/globals/shop-home-hero?depth=1`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CmsHeroRaw;
    return mapShopHero(data);
  } catch {
    return null;
  }
}

export function fallbackShopHomeHero(messages: {
  eyebrow: string;
  title: string;
  subtitle: string;
}): ShopHomeHeroContent {
  return {
    enabled: true,
    eyebrow: messages.eyebrow,
    headline: messages.title,
    subtitle: messages.subtitle,
    displayMode: 'text',
    videoAutoplay: true,
  };
}
