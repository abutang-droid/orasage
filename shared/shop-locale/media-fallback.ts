/**
 * Product PDP media locale fallback (hero images + videos).
 *
 * Rule: if the current locale has no media for a field, reuse another language’s
 * version. Priority after the requested locale: English → 简体中文.
 *
 * Catalog list thumbs (`shop-product-images`) are SKU-scoped and not locale-specific.
 */

export const PRODUCT_MEDIA_FALLBACK_LOCALES = ['en', 'zh-CN'] as const;

export function productMediaLocaleChain(locale: string): string[] {
  const chain: string[] = [];
  const push = (code: string) => {
    const c = code?.trim();
    if (c && !chain.includes(c)) chain.push(c);
  };
  push(locale);
  for (const code of PRODUCT_MEDIA_FALLBACK_LOCALES) push(code);
  return chain;
}

export type ProductMediaBundle<THero> = {
  heroImages: THero[];
  galleryVideoUrl?: string;
  sceneVideoUrl?: string;
};

export type ProductMediaSources = {
  heroImages?: string;
  galleryVideoUrl?: string;
  sceneVideoUrl?: string;
};

type MediaPageLike<THero> = {
  locale?: string;
  heroImages?: THero[] | null;
  galleryVideoUrl?: string | null;
  sceneVideoUrl?: string | null;
};

function hasHeroes<THero>(heroes: THero[] | null | undefined): boolean {
  return Array.isArray(heroes) && heroes.length > 0;
}

function videoUrl(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v || undefined;
}

/**
 * Merge media fields along a pre-ordered page list (current → en → zh-CN).
 * First non-empty value wins per field.
 */
export function mergeProductMediaFromPages<THero>(
  pages: Array<MediaPageLike<THero> | null | undefined>,
): { media: ProductMediaBundle<THero>; sources: ProductMediaSources } {
  let heroImages: THero[] = [];
  let galleryVideoUrl: string | undefined;
  let sceneVideoUrl: string | undefined;
  const sources: ProductMediaSources = {};

  for (const page of pages) {
    if (!page) continue;
    const loc = page.locale ?? 'unknown';
    if (!heroImages.length && hasHeroes(page.heroImages)) {
      heroImages = page.heroImages as THero[];
      sources.heroImages = loc;
    }
    if (!galleryVideoUrl) {
      const g = videoUrl(page.galleryVideoUrl);
      if (g) {
        galleryVideoUrl = g;
        sources.galleryVideoUrl = loc;
      }
    }
    if (!sceneVideoUrl) {
      const s = videoUrl(page.sceneVideoUrl);
      if (s) {
        sceneVideoUrl = s;
        sources.sceneVideoUrl = loc;
      }
    }
    if (heroImages.length && galleryVideoUrl && sceneVideoUrl) break;
  }

  return {
    media: { heroImages, galleryVideoUrl, sceneVideoUrl },
    sources,
  };
}

export function mediaFallbackRuleLabel(locale = 'zh-CN'): string {
  if (locale.startsWith('en')) {
    return 'Media fallback: English → 简体中文 (per field). List thumbnail is shared across languages.';
  }
  return '媒体回退：当前语言未设置时按 英语 → 简体中文 取已有图/视频；列表主图全语言共用。';
}
