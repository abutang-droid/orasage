'use client';

import { useEffect, useState } from 'react';
import {
  fetchZiweiHomeHero,
  fallbackZiweiHomeHero,
  type ZiweiHomeHeroContent,
} from '@/lib/cms-ziwei-hero';
import { useT } from '@/lib/i18n';

function HeroVideo({
  src,
  poster,
  autoplay = true,
}: {
  src: string;
  poster?: string | null;
  autoplay?: boolean;
}) {
  return (
    <div className="ziwei-hero-video" aria-hidden>
      <video
        src={src}
        poster={poster ?? undefined}
        autoPlay={autoplay}
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
}

/** CMS 可配置的紫微计算器 Hero — 结构与八字 BaziHomeHero 一致 */
export function ZiweiHomeHero() {
  const t = useT();
  const [hero, setHero] = useState<ZiweiHomeHeroContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchZiweiHomeHero(
      fallbackZiweiHomeHero({
        eyebrow: t('home.eyebrow'),
        title: t('home.title'),
        subtitle: t('home.subtitle'),
      }),
    ).then((content) => {
      if (cancelled) return;
      setHero(content);
    });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const title = t('home.title');
  const content = hero?.enabled ? hero : null;

  return (
    <section className="ziwei-hero" aria-busy={!hero ? true : undefined}>
      {!content ? (
        <div className="ziwei-hero-inner ziwei-hero-skeleton">
          <h1 className="sr-only">{title}</h1>
        </div>
      ) : (
        <>
          {content.displayMode === 'video' && content.videoUrl ? (
            <HeroVideo
              src={content.videoUrl}
              poster={content.videoPosterUrl}
              autoplay={content.videoAutoplay}
            />
          ) : null}

          <div
            className={`ziwei-hero-inner orasage-fade-in${
              Boolean(content.displayMode === 'image' && content.imageUrl)
              && !content.headline
              && !content.eyebrow
              && !content.subtitle
              && !content.bodyText
                ? ' ziwei-hero-inner--media-only'
                : ''
            }`}
          >
            {content.eyebrow ? <p className="ziwei-hero-eyebrow">{content.eyebrow}</p> : null}

            {content.headline ? (
              <h1 className="ziwei-hero-title">{content.headline}</h1>
            ) : (
              <h1 className="sr-only">{title}</h1>
            )}

            {content.subtitle ? <p className="ziwei-hero-subtitle">{content.subtitle}</p> : null}

            {content.displayMode === 'image' && content.imageUrl ? (
              <div className="ziwei-hero-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.imageUrl}
                  alt={content.imageAlt ?? ''}
                  className="ziwei-hero-image"
                  width={1600}
                  height={900}
                />
              </div>
            ) : null}

            {content.bodyText ? <p className="ziwei-hero-body">{content.bodyText}</p> : null}
          </div>
        </>
      )}
    </section>
  );
}
