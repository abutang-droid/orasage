import {
  mapCmsHeroContent,
  type CmsHeroRaw,
  type HeroDisplayMode,
  type MappedHeroContent,
} from '../../shared/hero/map-cms-hero';
import { resolveHeroWithFallback } from '../../shared/hero/resolve-hero';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';
const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'https://admin.orasage.com/cms';

/** 浏览器走同源 API 路由，避免跨域 CORS 导致拉取失败后误用 enabled:true 的 fallback */
function heroApiUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api/cms/ziwei-home-hero';
  }
  return `${CMS_INTERNAL_URL}/api/globals/ziwei-home-hero?depth=1`;
}

export type ZiweiHeroDisplayMode = HeroDisplayMode;
export type ZiweiHomeHeroContent = MappedHeroContent;

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

function mapZiweiHero(data: CmsHeroRaw): ZiweiHomeHeroContent | null {
  return mapCmsHeroContent(data, resolveMediaUrl);
}

export async function resolveZiweiHeroFromRaw(
  data: CmsHeroRaw,
  fallback: ZiweiHomeHeroContent,
): Promise<ZiweiHomeHeroContent> {
  const mapped = mapZiweiHero(data);
  return resolveHeroWithFallback(mapped, fallback, {
    publicCmsBase: CMS_PUBLIC_URL,
    internalCmsBase: CMS_INTERNAL_URL,
  });
}

export async function fetchZiweiHomeHero(
  fallback: ZiweiHomeHeroContent,
): Promise<ZiweiHomeHeroContent> {
  try {
    const res = await fetch(heroApiUrl(), {
      cache: 'no-store',
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as ZiweiHomeHeroContent | CmsHeroRaw;
    if (data && typeof data === 'object' && 'displayMode' in data && 'enabled' in data) {
      return data as ZiweiHomeHeroContent;
    }
    return resolveZiweiHeroFromRaw(data as CmsHeroRaw, fallback);
  } catch {
    return fallback;
  }
}

export function fallbackZiweiHomeHero(messages: {
  eyebrow: string;
  title: string;
  subtitle: string;
}): ZiweiHomeHeroContent {
  return {
    enabled: true,
    eyebrow: messages.eyebrow,
    headline: messages.title,
    subtitle: messages.subtitle,
    displayMode: 'text',
    videoAutoplay: true,
  };
}
