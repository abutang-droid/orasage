'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchTarotHomeHero,
  type TarotHomeHeroContent,
} from '@/lib/cms-tarot-hero';
import { TarotMiniCard } from '@/components/home/TarotMiniCard';
import { useHomeCopy } from '@/lib/i18n/reading-copy';
import { useUser } from '@/lib/user';

const MANTO_PORTRAIT = '/images/manto-mentor.png';

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
  const { user } = useUser();
  const home = useHomeCopy();
  const [hero, setHero] = useState<TarotHomeHeroContent | null>(null);

  const displayName = useMemo(() => {
    const name = user?.nickname?.trim();
    if (name && name !== home.traveler) return name;
    return null;
  }, [user?.nickname, home.traveler]);

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
  const mentorLine = hero.bodyText?.trim() || home.mentorFallback;

  return (
    <section className="tarot-home-hero tarot-home-hero--visual animate-fade-in-up">
      <div className="tarot-home-hero-top">
        <div className="tarot-home-hero-manto">
          <Image
            src={MANTO_PORTRAIT}
            alt=""
            width={48}
            height={48}
            className="tarot-home-hero-manto-img"
            aria-hidden
          />
          <div className="tarot-home-hero-manto-copy">
            <p className="tarot-home-hero-greeting">
              {home.greeting()}
              {displayName ? `, ${displayName}` : ''}
            </p>
            <p className="tarot-home-hero-manto-line">{mentorLine}</p>
          </div>
        </div>

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
