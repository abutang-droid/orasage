'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  fetchTarotHomeHero,
  fallbackTarotHomeHero,
  type TarotHomeHeroContent,
} from '@/lib/cms-tarot-hero';
import { TarotMiniCard } from '@/components/home/TarotMiniCard';
import { useHomeCopy } from '@/lib/i18n/reading-copy';

function HeroCards() {
  return (
    <div className="tarot-home-hero-stage-scene animate-float" aria-hidden>
      <div className="tarot-home-hero-stage-scene-glow" />
      <TarotMiniCard
        src="/cards/back.webp"
        className="tarot-home-hero-stage-card tarot-home-hero-stage-card--left"
        rotate={-16}
        width={96}
        height={142}
      />
      <TarotMiniCard
        src="/cards/back.webp"
        className="tarot-home-hero-stage-card tarot-home-hero-stage-card--right"
        rotate={16}
        width={96}
        height={142}
      />
      <TarotMiniCard
        src="/cards/1.webp"
        className="tarot-home-hero-stage-card tarot-home-hero-stage-card--center"
        rotate={-2}
        glow
        priority
        width={112}
        height={166}
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
    <div className="tarot-home-hero-stage-video">
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

/** 首页 Hero：标题/引导在前，主视觉按图片比例自适应 */
export function TarotHomeHero() {
  const home = useHomeCopy();
  const [hero, setHero] = useState<TarotHomeHeroContent>(() => fallbackTarotHomeHero(home.lang));

  useEffect(() => {
    let cancelled = false;
    void fetchTarotHomeHero(home.lang).then((content) => {
      if (cancelled) return;
      setHero(content.enabled ? content : fallbackTarotHomeHero(home.lang));
    });
    return () => {
      cancelled = true;
    };
  }, [home.lang]);

  const showImage = hero.displayMode === 'image' && hero.imageUrl;
  const showVideo = hero.displayMode === 'video' && hero.videoUrl;
  const headline = hero.headline?.trim() || home.heroHeadline;
  const subtitle = hero.subtitle?.trim() || home.heroSubtitle;
  const mediaMode = showVideo ? 'video' : showImage ? 'image' : 'cards';

  return (
    <section
      className={`tarot-home-hero tarot-home-hero--stage tarot-home-hero--stage-${mediaMode}`}
      aria-label="Hero"
    >
      <div className="tarot-home-hero-stage-copy animate-fade-in-up">
        <p className="tarot-home-hero-brand">Manto</p>
        <h1 className="tarot-home-hero-headline">{headline}</h1>
        <p className="tarot-home-hero-support">{subtitle}</p>
        <div className="tarot-home-hero-cta-group">
          <Link href="/daily-fortune" className="tarot-home-hero-cta">
            {home.dailyCta}
          </Link>
        </div>
      </div>

      <div className="tarot-home-hero-stage-media">
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
            className="tarot-home-hero-stage-image"
          />
        ) : (
          <HeroCards />
        )}
      </div>
    </section>
  );
}
