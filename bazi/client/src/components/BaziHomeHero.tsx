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
    void fetchBaziHomeHero().then((content) => {
      if (cancelled) return;
      setHero(
        content ??
          fallbackBaziHomeHero({
            eyebrow: t('home.eyebrow'),
            title: t('home.title'),
            subtitle: t('home.subtitle'),
          }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [locale, t]);

  if (!hero?.enabled) return null;

  const showImage = hero.displayMode === 'image' && hero.imageUrl;
  const showVideo = hero.displayMode === 'video' && hero.videoUrl;

  return (
    <section className="bazi-hero">
      {showVideo ? (
        <HeroVideo
          src={hero.videoUrl!}
          poster={hero.videoPosterUrl}
          autoplay={hero.videoAutoplay}
        />
      ) : null}

      <div className="bazi-hero-inner animate-fade-in-up">
        {hero.eyebrow ? <p className="bazi-hero-eyebrow">{hero.eyebrow}</p> : null}

        <h1 className="bazi-hero-title">{hero.headline}</h1>

        {hero.subtitle ? <p className="bazi-hero-subtitle">{hero.subtitle}</p> : null}

        {showImage ? (
          <img src={hero.imageUrl!} alt="" className="bazi-hero-image" />
        ) : null}

        {hero.bodyText ? <p className="bazi-hero-body">{hero.bodyText}</p> : null}
      </div>
    </section>
  );
}
