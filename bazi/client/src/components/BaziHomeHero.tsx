import { useEffect, useState } from 'react';
import {
  fetchBaziHomeHero,
  fallbackBaziHomeHero,
  type BaziHomeHeroContent,
} from '@/lib/cms-bazi-hero';
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
    <div className="bazi-hero-video" aria-hidden>
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

export function BaziHomeHero() {
  const { t, locale } = useT();
  const [hero, setHero] = useState<BaziHomeHeroContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchBaziHomeHero(
      fallbackBaziHomeHero({
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
  }, [locale, t]);

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
    <section className="bazi-hero">
      {showVideo ? (
        <HeroVideo
          src={hero.videoUrl!}
          poster={hero.videoPosterUrl}
          autoplay={hero.videoAutoplay}
        />
      ) : null}

      <div className={`bazi-hero-inner animate-fade-in-up${mediaOnly ? ' bazi-hero-inner--media-only' : ''}`}>
        {hero.eyebrow ? <p className="bazi-hero-eyebrow">{hero.eyebrow}</p> : null}

        {hero.headline ? <h1 className="bazi-hero-title">{hero.headline}</h1> : null}

        {hero.subtitle ? <p className="bazi-hero-subtitle">{hero.subtitle}</p> : null}

        {showImage ? (
          <img src={hero.imageUrl!} alt={hero.imageAlt ?? ''} className="bazi-hero-image" />
        ) : null}

        {hero.bodyText ? <p className="bazi-hero-body">{hero.bodyText}</p> : null}
      </div>
    </section>
  );
}
