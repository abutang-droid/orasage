'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';

type ProductHeroGalleryProps = {
  images: Array<{ url: string; alt: string }>;
  productName: string;
  fallbackUrl?: string | null;
  category?: string;
};

export function ProductHeroGallery({
  images,
  productName,
  fallbackUrl,
}: ProductHeroGalleryProps) {
  const slides =
    images.length > 0
      ? images
      : fallbackUrl
        ? [{ url: fallbackUrl, alt: productName }]
        : [];

  const [index, setIndex] = useState(0);
  const active = slides[index] ?? slides[0];

  const go = useCallback(
    (next: number) => {
      if (!slides.length) return;
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length],
  );

  if (!active) {
    return <div className="shop-pdp-gallery-placeholder" aria-hidden />;
  }

  return (
    <div className="shop-pdp-gallery">
      <div className="shop-pdp-gallery-stage">
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="shop-pdp-gallery-image"
          priority
        />
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              className="shop-pdp-gallery-nav shop-pdp-gallery-nav--prev"
              onClick={() => go(index - 1)}
              aria-label="上一张"
            >
              ‹
            </button>
            <button
              type="button"
              className="shop-pdp-gallery-nav shop-pdp-gallery-nav--next"
              onClick={() => go(index + 1)}
              aria-label="下一张"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      {slides.length > 1 ? (
        <div className="shop-pdp-gallery-dots" role="tablist" aria-label="商品图片">
          {slides.map((slide, i) => (
            <button
              key={`${slide.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`第 ${i + 1} 张`}
              className={`shop-pdp-gallery-dot${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
