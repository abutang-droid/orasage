'use client';

import Image from 'next/image';
import { useState } from 'react';

type GallerySlide =
  | { kind: 'image'; url: string; alt: string }
  | { kind: 'video'; url: string; poster?: string };

type ProductHeroGalleryProps = {
  images: Array<{ url: string; alt: string }>;
  productName: string;
  fallbackUrl?: string | null;
  videoUrl?: string | null;
};

/** 无视频最多 5 图；有主图视频时 = 视频首帧 + 最多 4 图 */
const MAX_SLIDES = 5;

export function ProductHeroGallery({
  images,
  productName,
  fallbackUrl,
  videoUrl,
}: ProductHeroGalleryProps) {
  const baseImages: Array<{ url: string; alt: string }> =
    images.length > 0
      ? images
      : fallbackUrl
        ? [{ url: fallbackUrl, alt: productName }]
        : [];

  const hasVideo = Boolean(videoUrl?.trim());
  const maxImages = hasVideo ? MAX_SLIDES - 1 : MAX_SLIDES;
  const imageSlides: GallerySlide[] = baseImages
    .slice(0, maxImages)
    .map((img) => ({ kind: 'image' as const, url: img.url, alt: img.alt }));

  // 主图视频占 Hero 首帧（详情页打开即播），图片跟在后面
  const slides: GallerySlide[] = hasVideo
    ? [
        {
          kind: 'video',
          url: videoUrl!.trim(),
          poster: baseImages[0]?.url,
        },
        ...imageSlides,
      ]
    : imageSlides;

  const [index, setIndex] = useState(0);
  const active = slides[index] ?? slides[0];

  if (!active) {
    return <div className="shop-pdp-gallery-placeholder" aria-hidden />;
  }

  return (
    <div className="shop-pdp-gallery">
      <div className={`shop-pdp-gallery-stage${active.kind === 'video' ? ' is-video' : ''}`}>
        {active.kind === 'video' ? (
          <video
            key={active.url}
            className="shop-pdp-gallery-video"
            src={active.url}
            poster={active.poster}
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        ) : (
          <Image
            src={active.url}
            alt={active.alt || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="shop-pdp-gallery-image"
            priority
          />
        )}
      </div>

      {slides.length > 1 ? (
        <div className="shop-pdp-gallery-thumbs" role="tablist" aria-label="商品主图">
          {slides.map((slide, i) => (
            <button
              key={`${slide.kind}-${slide.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={slide.kind === 'video' ? '主图视频' : `第 ${i + 1} 张`}
              className={`shop-pdp-gallery-thumb${i === index ? ' is-active' : ''}${
                slide.kind === 'video' ? ' is-video' : ''
              }`}
              onClick={() => setIndex(i)}
            >
              {slide.kind === 'video' ? (
                <>
                  {slide.poster ? (
                    <Image src={slide.poster} alt="" fill sizes="80px" className="shop-pdp-gallery-thumb-img" />
                  ) : (
                    <span className="shop-pdp-gallery-thumb-video-fallback" aria-hidden />
                  )}
                  <span className="shop-pdp-gallery-thumb-play" aria-hidden>
                    ▶
                  </span>
                </>
              ) : (
                <Image src={slide.url} alt="" fill sizes="80px" className="shop-pdp-gallery-thumb-img" />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
