import {
  mapCmsHeroContent,
  type CmsHeroRaw,
  type MappedHeroContent,
} from '../../shared/hero/map-cms-hero';
import { resolveHeroWithFallback } from '../../shared/hero/resolve-hero';

const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL || 'https://admin.orasage.com/cms';

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

function mapBaziHero(data: CmsHeroRaw): MappedHeroContent | null {
  return mapCmsHeroContent(data, resolveMediaUrl);
}

export function fallbackBaziHomeHero(messages: {
  eyebrow: string;
  title: string;
  subtitle: string;
}): MappedHeroContent {
  return {
    enabled: true,
    eyebrow: messages.eyebrow,
    headline: messages.title,
    subtitle: messages.subtitle,
    displayMode: 'text',
    videoAutoplay: true,
  };
}

export async function resolveBaziHeroFromRaw(
  data: CmsHeroRaw,
  fallback: MappedHeroContent,
): Promise<MappedHeroContent> {
  const mapped = mapBaziHero(data);
  return resolveHeroWithFallback(mapped, fallback);
}
