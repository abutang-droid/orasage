import {
  mapCmsHeroContent,
  type CmsHeroRaw,
  type HeroDisplayMode,
  type MappedHeroContent,
} from '../../../shared/hero/map-cms-hero';
import { resolveHeroWithFallback } from '../../../shared/hero/resolve-hero';

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

const CJK_RE = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/;

function isZhLocale(locale: string) {
  return locale === 'zh-CN' || locale === 'zh-TW' || locale.startsWith('zh');
}

/**
 * Prefer i18n fallback headline/subtitle when CMS copy is in the wrong script
 * for the active locale (root cause of `/en` H1 showing Chinese).
 */
function localizeHeroText(
  hero: HomeHeroContent,
  locale: string,
  fallback: HomeHeroContent,
): HomeHeroContent {
  if (!hero.enabled) return hero;
  if (isZhLocale(locale)) return hero;

  const headline = hero.headline?.trim() ?? '';
  const subtitle = hero.subtitle?.trim() ?? '';
  const patch: Partial<HomeHeroContent> = {};
  if (!headline || CJK_RE.test(headline)) {
    patch.headline = fallback.headline;
  }
  if (!subtitle || CJK_RE.test(subtitle)) {
    patch.subtitle = fallback.subtitle;
  }
  return Object.keys(patch).length ? { ...hero, ...patch } : hero;
}

export async function fetchHomeHero(
  locale: string,
  fallback: HomeHeroContent,
): Promise<HomeHeroContent> {
  try {
    const res = await fetch(`${CMS_INTERNAL_URL}/api/globals/home-hero?depth=1`, {
      cache: 'no-store',
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as CmsHeroRaw;
    const mapped = mapHomeHero(data);
    const resolved = await resolveHeroWithFallback(mapped, fallback, {
      publicCmsBase: CMS_PUBLIC_URL,
      internalCmsBase: CMS_INTERNAL_URL,
    });
    return localizeHeroText(resolved, locale, fallback);
  } catch {
    return fallback;
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
