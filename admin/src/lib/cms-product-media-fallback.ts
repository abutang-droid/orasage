import {
  mediaFallbackRuleLabel,
  mergeProductMediaFromPages,
  productMediaLocaleChain,
  type ProductMediaSources,
} from '../../../shared/shop-locale/media-fallback';
import {
  getCmsProductPageDoc,
  type CmsHeroImageRow,
  type CmsProductPageDoc,
} from './cms-content-api';

export { mediaFallbackRuleLabel, productMediaLocaleChain };

export type ResolvedProductPageMedia = {
  /** Exact doc for the requested locale (may be null). */
  own: CmsProductPageDoc | null;
  /** First available page doc along the chain (for copy when own is missing). */
  base: CmsProductPageDoc | null;
  heroImages: CmsHeroImageRow[];
  galleryVideoUrl?: string;
  sceneVideoUrl?: string;
  /** Which locale supplied each media field after fallback. */
  sources: ProductMediaSources;
};

/** Load page docs along en→zh-CN chain and merge media fields for admin preview. */
export async function resolveCmsProductPageMedia(
  sku: string,
  locale: string,
  token: string,
): Promise<ResolvedProductPageMedia> {
  const chain = productMediaLocaleChain(locale);
  const docs = await Promise.all(chain.map((code) => getCmsProductPageDoc(sku, code, token)));
  const pages = docs.map((doc, i) =>
    doc
      ? {
          locale: doc.locale || chain[i],
          heroImages: doc.heroImages ?? [],
          galleryVideoUrl: doc.galleryVideoUrl,
          sceneVideoUrl: doc.sceneVideoUrl,
        }
      : null,
  );
  const { media, sources } = mergeProductMediaFromPages(pages);
  return {
    own: docs[0] ?? null,
    base: docs.find(Boolean) ?? null,
    heroImages: media.heroImages,
    galleryVideoUrl: media.galleryVideoUrl,
    sceneVideoUrl: media.sceneVideoUrl,
    sources,
  };
}

const LOCALE_LABEL: Record<string, string> = {
  'zh-CN': '简体中文',
  en: 'English',
  'pt-BR': 'Português',
};

export function localeDisplayName(code: string): string {
  return LOCALE_LABEL[code] ?? code;
}

/** Human-readable note when current locale borrows media from another. */
export function mediaFallbackNotice(
  locale: string,
  sources: ProductMediaSources,
): string | null {
  const borrowed = Object.entries(sources).filter(([, from]) => from && from !== locale);
  if (borrowed.length === 0) return null;
  const parts = borrowed.map(([field, from]) => {
    const label =
      field === 'heroImages' ? '轮播图' : field === 'galleryVideoUrl' ? '主图视频' : '场景视频';
    return `${label}←${localeDisplayName(from!)}`;
  });
  return `当前语言未单独设置，前台将使用：${parts.join(' · ')}（回退顺序：英语 → 简体）`;
}
