const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.orasage.com';

export type HomeHeroDisplayMode = 'text' | 'image' | 'video';

export type HomeHeroContent = {
  enabled: boolean;
  eyebrow?: string | null;
  headline: string;
  subtitle?: string | null;
  displayMode: HomeHeroDisplayMode;
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

type CmsHomeHeroRaw = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  headline?: string | null;
  subtitle?: string | null;
  displayMode?: HomeHeroDisplayMode | null;
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
  return `${CMS_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function mapHomeHero(data: CmsHomeHeroRaw): HomeHeroContent | null {
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

export async function fetchHomeHero(_locale: string): Promise<HomeHeroContent | null> {
  try {
    const res = await fetch(`${CMS_URL}/api/globals/home-hero?depth=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CmsHomeHeroRaw;
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
