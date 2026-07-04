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

export type ZiweiHeroDisplayMode = 'text' | 'image' | 'video';

export type ZiweiHomeHeroContent = {
  enabled: boolean;
  eyebrow?: string | null;
  headline: string;
  subtitle?: string | null;
  displayMode: ZiweiHeroDisplayMode;
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  videoAutoplay: boolean;
  bodyText?: string | null;
};

type CmsMedia = {
  url?: string | null;
  mimeType?: string | null;
};

type CmsZiweiHeroRaw = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  headline?: string | null;
  subtitle?: string | null;
  displayMode?: ZiweiHeroDisplayMode | null;
  heroImage?: CmsMedia | number | null;
  heroVideo?: CmsMedia | number | null;
  videoExternalUrl?: string | null;
  videoAutoplay?: boolean | null;
  bodyText?: string | null;
};

function resolveMediaUrl(media: CmsMedia | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  const url = media.url;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${CMS_PUBLIC_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function mapZiweiHero(data: CmsZiweiHeroRaw): ZiweiHomeHeroContent | null {
  if (!data.headline?.trim()) return null;
  const displayMode = data.displayMode ?? 'text';
  const imageUrl = resolveMediaUrl(
    typeof data.heroImage === 'object' ? data.heroImage : null,
  );
  const uploadedVideoUrl = resolveMediaUrl(
    typeof data.heroVideo === 'object' ? data.heroVideo : null,
  );

  return {
    enabled: data.enabled !== false,
    eyebrow: data.eyebrow,
    headline: data.headline.trim(),
    subtitle: data.subtitle,
    displayMode,
    imageUrl,
    videoUrl: data.videoExternalUrl?.trim() || uploadedVideoUrl,
    videoPosterUrl: imageUrl,
    videoAutoplay: data.videoAutoplay !== false,
    bodyText: data.bodyText,
  };
}

export async function fetchZiweiHomeHero(): Promise<ZiweiHomeHeroContent | null> {
  try {
    const res = await fetch(heroApiUrl(), {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CmsZiweiHeroRaw;
    return mapZiweiHero(data);
  } catch {
    return null;
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
