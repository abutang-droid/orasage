export type HeroDisplayMode = 'text' | 'image' | 'video';

export type CmsHeroMedia = {
  url?: string | null;
  alt?: string | null;
  mimeType?: string | null;
};

export type CmsHeroRaw = {
  enabled?: boolean | null;
  eyebrow?: string | null;
  headline?: string | null;
  subtitle?: string | null;
  displayMode?: HeroDisplayMode | null;
  heroImage?: CmsHeroMedia | number | null;
  heroVideo?: CmsHeroMedia | number | null;
  videoExternalUrl?: string | null;
  videoAutoplay?: boolean | null;
  bodyText?: string | null;
};

export type MappedHeroContent = {
  enabled: boolean;
  eyebrow?: string | null;
  headline?: string | null;
  subtitle?: string | null;
  displayMode: HeroDisplayMode;
  imageUrl?: string | null;
  imageAlt?: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  videoAutoplay: boolean;
  bodyText?: string | null;
};

/** 将 CMS Hero Global 映射为前台结构；图片/视频模式可不填标题 */
export function mapCmsHeroContent(
  data: CmsHeroRaw,
  resolveMediaUrl: (media: CmsHeroMedia | number | null | undefined) => string | null,
): MappedHeroContent | null {
  if (data.enabled === false) {
    return {
      enabled: false,
      displayMode: data.displayMode ?? 'text',
      videoAutoplay: data.videoAutoplay !== false,
    };
  }

  const displayMode = data.displayMode ?? 'text';
  const heroImageObj = typeof data.heroImage === 'object' ? data.heroImage : null;
  const imageUrl = resolveMediaUrl(heroImageObj);
  const uploadedVideoUrl = resolveMediaUrl(
    typeof data.heroVideo === 'object' ? data.heroVideo : null,
  );
  const videoUrl = data.videoExternalUrl?.trim() || uploadedVideoUrl || null;
  const headline = data.headline?.trim() || null;

  if (displayMode === 'text' && !headline) return null;
  if (displayMode === 'image' && !imageUrl) return null;
  if (displayMode === 'video' && !videoUrl) return null;

  return {
    enabled: true,
    eyebrow: data.eyebrow,
    headline,
    subtitle: data.subtitle,
    displayMode,
    imageUrl,
    imageAlt: heroImageObj?.alt?.trim() || null,
    videoUrl,
    videoPosterUrl: imageUrl,
    videoAutoplay: data.videoAutoplay !== false,
    bodyText: data.bodyText,
  };
}
