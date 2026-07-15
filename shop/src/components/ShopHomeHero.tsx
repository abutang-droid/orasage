import Image from 'next/image';
import {
  fetchShopHomeHero,
  fallbackShopHomeHero,
} from '@/lib/cms-shop-hero';
import { getTranslations } from 'next-intl/server';

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
    <div className="shop-hero-video" aria-hidden>
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
  loggedIn?: boolean;
};

/** CMS 可配置的商城首页 Hero */
export async function ShopHomeHero({ loggedIn }: Props) {
  const th = await getTranslations('home');
  const fallback = fallbackShopHomeHero({
    eyebrow: th('heroEyebrow'),
    title: th('heroTitle'),
    subtitle: th('heroSubtitle'),
  });
  const hero = await fetchShopHomeHero(fallback);

  if (!hero.enabled) {
    return (
      <section className="shop-hero">
        <h1 className="sr-only">{th('heroTitle')}</h1>
      </section>
    );
  }

  const showImage = hero.displayMode === 'image' && hero.imageUrl;
  const showVideo = hero.displayMode === 'video' && hero.videoUrl;
  const mediaOnly =
    Boolean(showImage || showVideo) &&
    !hero.headline &&
    !hero.eyebrow &&
    !hero.subtitle &&
    !hero.bodyText;

  return (
    <section className="shop-hero">
      {showVideo ? (
        <HeroVideo
          src={hero.videoUrl!}
          poster={hero.videoPosterUrl}
          autoplay={hero.videoAutoplay}
        />
      ) : null}

      <div className={`shop-hero-inner${mediaOnly ? ' shop-hero-inner--media-only' : ''}`}>
        {hero.eyebrow ? <p className="shop-hero-eyebrow">{hero.eyebrow}</p> : null}

        {hero.headline ? (
          <h1 className="shop-hero-title">{hero.headline}</h1>
        ) : (
          <h1 className="sr-only">{th('heroTitle')}</h1>
        )}

        {hero.subtitle ? <p className="shop-hero-subtitle">{hero.subtitle}</p> : null}

        {showImage ? (
          <div className="shop-hero-image-wrap">
            <Image
              src={hero.imageUrl!}
              alt={hero.imageAlt ?? ''}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 72rem"
              className="shop-hero-image"
            />
          </div>
        ) : null}

        {hero.bodyText ? <p className="shop-hero-body">{hero.bodyText}</p> : null}

        {loggedIn ? (
          <p className="shop-hero-meta">{th('heroLoggedIn')}</p>
        ) : null}
      </div>
    </section>
  );
}
