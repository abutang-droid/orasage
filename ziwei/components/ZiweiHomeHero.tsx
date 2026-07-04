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
    void fetchZiweiHomeHero().then((content) => {
      if (cancelled) return;
      setHero(
        content ??
          fallbackZiweiHomeHero({
            eyebrow: t('home.eyebrow'),
            title: t('home.title'),
            subtitle: t('home.subtitle'),
          }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (!hero?.enabled) return null;

  const showImage = hero.displayMode === 'image' && hero.imageUrl;
  const showVideo = hero.displayMode === 'video' && hero.videoUrl;
  const mediaOnly =
    Boolean(showImage || showVideo) &&
    !hero.headline &&
    !hero.eyebrow &&
    !hero.subtitle &&
    !hero.bodyText;

  return (
    <section className="ziwei-hero">
      {showVideo ? (
        <HeroVideo
          src={hero.videoUrl!}
          poster={hero.videoPosterUrl}
          autoplay={hero.videoAutoplay}
        />
      ) : null}

      <div className={`ziwei-hero-inner orasage-fade-in${mediaOnly ? ' ziwei-hero-inner--media-only' : ''}`}>
        {hero.eyebrow ? <p className="ziwei-hero-eyebrow">{hero.eyebrow}</p> : null}

        {hero.headline ? <h1 className="ziwei-hero-title">{hero.headline}</h1> : null}

        {hero.subtitle ? <p className="ziwei-hero-subtitle">{hero.subtitle}</p> : null}

        {showImage ? (
          <img src={hero.imageUrl!} alt={hero.imageAlt ?? ''} className="ziwei-hero-image" />
        ) : null}

        {hero.bodyText ? <p className="ziwei-hero-body">{hero.bodyText}</p> : null}
      </div>
    </section>
  );
}
