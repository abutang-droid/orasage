'use client';

import Image from 'next/image';
import { useState } from 'react';
import { isCmsMediaUrl } from '@/lib/cms-media';

function CmsAwareImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const unoptimized = isCmsMediaUrl(src) || src.startsWith('http://') || src.startsWith('https://');
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={unoptimized}
    />
  );
}

type GallerySlide =
  | { kind: 'image'; url: string; alt: string }
  | { kind: 'video'; url: string; poster?: string };

type ProductHeroGalleryProps = {
  images: Array<{ url: string; alt: string }>;
  productName: string;
  fallbackUrl?: string | null;
  videoUrl?: string | null;
};

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

  const maxImages = videoUrl ? MAX_SLIDES - 1 : MAX_SLIDES;
  const slides: GallerySlide[] = baseImages
    .slice(0, maxImages)
    .map((img) => ({ kind: 'image' as const, url: img.url, alt: img.alt }));

  if (videoUrl) {
    slides.push({ kind: 'video', url: videoUrl, poster: baseImages[0]?.url });
  }

  const [index, setIndex] = useState(0);
  const active = slides[index] ?? slides[0];

  if (!active) {
    return <div className="shop-pdp-gallery-placeholder" aria-hidden />;
  }

  return (
    <div className="shop-pdp-gallery">
      <div className="shop-pdp-gallery-stage">
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
          <CmsAwareImage
            src={active.url}
            alt={active.alt || productName}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="shop-pdp-gallery-image"
            priority
          />
        )}
      </div>

      {slides.length > 1 ? (
        <div className="shop-pdp-gallery-thumbs" role="tablist" aria-label="商品图片">
          {slides.map((slide, i) => (
            <button
              key={`${slide.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={slide.kind === 'video' ? '商品视频' : `第 ${i + 1} 张图片`}
              className={`shop-pdp-gallery-thumb${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            >
              {slide.kind === 'video' ? (
                <>
                  {slide.poster ? (
                    <CmsAwareImage
                      src={slide.poster}
                      alt=""
                      sizes="80px"
                      className="shop-pdp-gallery-thumb-img"
                    />
                  ) : null}
                  <span className="shop-pdp-gallery-thumb-play" aria-hidden>
                    ▶
                  </span>
                </>
              ) : (
                <CmsAwareImage
                  src={slide.url}
                  alt=""
                  sizes="80px"
                  className="shop-pdp-gallery-thumb-img"
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
