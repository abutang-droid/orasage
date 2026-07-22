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
    <div className="tarot-home-hero-stage-video" aria-hidden>
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

/** 首页第一屏 Hero：品牌 + 主视觉 + 一句文案 + 主 CTA */
export function TarotHomeHero() {
  const home = useHomeCopy();
  const [hero, setHero] = useState<TarotHomeHeroContent>(() => fallbackTarotHomeHero(home.lang));

  useEffect(() => {
    let cancelled = false;
    void fetchTarotHomeHero(home.lang).then((content) => {
      if (cancelled) return;
      // CMS 显式关闭时仍保留本地 fallback，保证首页第一屏始终是 Hero
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

  return (
    <section className="tarot-home-hero tarot-home-hero--stage" aria-label="Hero">
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
    </section>
  );
}
