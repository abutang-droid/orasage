'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  fallbackTarotHomeHero,
  fetchTarotHomeHero,
  type TarotHomeHeroContent,
} from '@/lib/cms-tarot-hero';
import { useUser } from '@/lib/user';

const MANTO_PORTRAIT = '/images/manto-mentor.png';

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 12) return '早安';
  if (h < 18) return '午安';
  return '晚安';
}

function HeroCards() {
  return (
    <div className="tarot-home-hero-cards animate-float">
      <div className="tarot-home-hero-card left">
        <div className="tarot-home-hero-card-inner tarot-home-hero-card-inner--gold">✦</div>
      </div>
      <div className="tarot-home-hero-card right">
        <div className="tarot-home-hero-card-inner tarot-home-hero-card-inner--gold">☽</div>
      </div>
      <div className="tarot-home-hero-card center">
        <div className="tarot-home-hero-card-inner tarot-home-hero-card-inner--gold">☀</div>
      </div>
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
  const [hero, setHero] = useState<TarotHomeHeroContent | null>(null);

  const displayName = useMemo(() => {
    const name = user?.nickname?.trim();
    if (name && name !== '旅人') return name;
    return null;
  }, [user?.nickname]);

  useEffect(() => {
    let cancelled = false;
    void fetchTarotHomeHero().then((content) => {
      if (!cancelled) setHero(content);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!hero?.enabled) return null;

  const showImage = hero.displayMode === 'image' && hero.imageUrl;
  const showVideo = hero.displayMode === 'video' && hero.videoUrl;
  const mentorLine = hero.bodyText?.trim() || 'Manto 为你守望着今日的星途';

  return (
    <section className="tarot-home-hero tarot-home-hero--v2 animate-fade-in-up">
      <div className="tarot-home-hero-manto">
        <Image
          src={MANTO_PORTRAIT}
          alt=""
          width={56}
          height={56}
          className="tarot-home-hero-manto-img"
          aria-hidden
        />
        <div>
          <p className="tarot-home-hero-greeting">
            {timeGreeting()}
            {displayName ? `，${displayName}` : ''}
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

      {hero.eyebrow ? <p className="tarot-home-hero-eyebrow">{hero.eyebrow}</p> : null}

      {hero.headline ? (
        <h1 className="tarot-home-title">{hero.headline}</h1>
      ) : null}

      {hero.subtitle ? <p className="tarot-home-subtitle">{hero.subtitle}</p> : null}
    </section>
  );
}
