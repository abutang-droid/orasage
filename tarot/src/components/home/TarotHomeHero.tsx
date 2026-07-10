'use client';

import { useEffect, useState } from 'react';
import {
  fetchTarotHomeHero,
  type TarotHomeHeroContent,
} from '@/lib/cms-tarot-hero';
import { TarotMiniCard } from '@/components/home/TarotMiniCard';
import { useHomeCopy } from '@/lib/i18n/reading-copy';

function HeroCards() {
  return (
    <div className="tarot-home-hero-scene animate-float" aria-hidden>
      <div className="tarot-home-hero-scene-glow" />
      <TarotMiniCard
        src="/cards/back.webp"
        className="tarot-home-hero-scene-card tarot-home-hero-scene-card--left"
        rotate={-14}
      />
      <TarotMiniCard
        src="/cards/back.webp"
        className="tarot-home-hero-scene-card tarot-home-hero-scene-card--right"
        rotate={14}
      />
      <TarotMiniCard
        src="/cards/1.webp"
        className="tarot-home-hero-scene-card tarot-home-hero-scene-card--center"
        rotate={-2}
        glow
        priority
      />
    </div>
  );
}

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
    <div className="tarot-home-hero-video" aria-hidden>
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

export function TarotHomeHero() {
  const home = useHomeCopy();
  const [hero, setHero] = useState<TarotHomeHeroContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchTarotHomeHero(home.lang).then((content) => {
      if (!cancelled) setHero(content);
    });
    return () => {
      cancelled = true;
    };
  }, [home.lang]);

  if (!hero?.enabled) return null;

  const showImage = hero.displayMode === 'image' && hero.imageUrl;
  const showVideo = hero.displayMode === 'video' && hero.videoUrl;

  return (
    <section className="tarot-home-hero tarot-home-hero--visual animate-fade-in-up delay-100">
      <div className="tarot-home-hero-media">
        {showVideo ? (
          <HeroVideo
            src={hero.videoUrl!}
            poster={hero.videoPosterUrl}
            autoplay={hero.videoAutoplay}
          />
        ) : showImage ? (
          <img
            src={hero.imageUrl!}
            alt={hero.imageAlt ?? ''}
            className="tarot-home-hero-cms-image"
          />
        ) : (
          <HeroCards />
        )}
      </div>

      <div className="tarot-home-hero-copy">
        {hero.eyebrow ? <p className="tarot-home-hero-eyebrow">{hero.eyebrow}</p> : null}
        {hero.headline ? <h1 className="tarot-home-title">{hero.headline}</h1> : null}
        {hero.subtitle ? <p className="tarot-home-subtitle">{hero.subtitle}</p> : null}
      </div>
    </section>
  );
}
