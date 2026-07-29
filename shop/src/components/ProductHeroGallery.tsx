'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = slides[index] ?? slides[0];
  const videoActive = active?.kind === 'video';

  // 仅当前滑到视频时挂载 src，避免一进页就拉完整 MP4
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoActive || active.kind !== 'video') return;
    if (el.getAttribute('src') !== active.url) {
      el.src = active.url;
      el.load();
    }
    void el.play().catch(() => {
      /* 自动播放被拦截时保留 controls */
    });
    return () => {
      el.pause();
    };
  }, [videoActive, active]);

  if (!active) {
    return <div className="shop-pdp-gallery-placeholder" aria-hidden />;
  }

  return (
    <div className="shop-pdp-gallery">
      <div className={`shop-pdp-gallery-stage${videoActive ? ' is-video' : ''}`}>
        {videoActive ? (
          <video
            ref={videoRef}
            key={active.url}
            className="shop-pdp-gallery-video"
            poster={active.poster}
            muted
            loop
            playsInline
            controls
            preload="metadata"
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
        <div className="shop-pdp-gallery-thumbs" role="tablist" aria-label="商品图片">
          {slides.map((slide, i) => (
            <button
              key={`${slide.kind}-${slide.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={slide.kind === 'video' ? '商品视频' : `第 ${i + 1} 张图片`}
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
