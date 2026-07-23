'use client';

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

type Props = {
  /** SSR 预取的 CMS Hero，避免首屏误用本地 cards fallback */
  initialHero?: TarotHomeHeroContent;
};

/** 首页 Hero：CMS 媒体优先；文案按语言字典补齐（图片/视频可 media-only） */
export function TarotHomeHero({ initialHero }: Props) {
  const home = useHomeCopy();
  const [hero, setHero] = useState<TarotHomeHeroContent>(
    () => initialHero ?? fallbackTarotHomeHero(home.lang),
  );

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

  const showImage = hero.displayMode === 'image' && Boolean(hero.imageUrl);
  const showVideo = hero.displayMode === 'video' && Boolean(hero.videoUrl);
  const mediaMode = showVideo ? 'video' : showImage ? 'image' : 'cards';

  // 图片/视频模式且 CMS 未填文案 → 仅展示媒体（与八字/紫微一致）
  const mediaOnly =
    (showImage || showVideo) &&
    !hero.headline?.trim() &&
    !hero.eyebrow?.trim() &&
    !hero.subtitle?.trim() &&
    !hero.bodyText?.trim();

  // 非 media-only：优先 CMS（非中文已由 API 换成字典译文），否则用 UI 字典
  const headline = mediaOnly ? '' : hero.headline?.trim() || home.heroHeadline;
  const subtitle = mediaOnly ? '' : hero.subtitle?.trim() || home.heroSubtitle;

  return (
    <section
      className={`tarot-home-hero tarot-home-hero--stage tarot-home-hero--stage-${mediaMode}${
        mediaOnly ? ' tarot-home-hero--stage-media-only' : ''
      }`}
      aria-label="Hero"
    >
      {!mediaOnly ? (
        <div className="tarot-home-hero-stage-copy animate-fade-in-up">
          <p className="tarot-home-hero-brand">Manto</p>
          {headline ? <h1 className="tarot-home-hero-headline">{headline}</h1> : null}
          {subtitle ? <p className="tarot-home-hero-support">{subtitle}</p> : null}
        </div>
      ) : null}

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
