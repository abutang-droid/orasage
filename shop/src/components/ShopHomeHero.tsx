import {
  fetchShopHomeHero,
  fallbackShopHomeHero,
  type ShopHomeHeroContent,
} from '@/lib/cms-shop-hero';

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
  const hero: ShopHomeHeroContent =
    (await fetchShopHomeHero()) ??
    fallbackShopHomeHero({
      eyebrow: 'OraSage',
      title: '能量商城',
      subtitle: '命理解读推荐 · 水晶手串 · 数字报告',
    });

  if (!hero.enabled) return null;

  const showImage = hero.displayMode === 'image' && hero.imageUrl;
  const showVideo = hero.displayMode === 'video' && hero.videoUrl;

  return (
    <section className="shop-hero">
      {showVideo ? (
        <HeroVideo
          src={hero.videoUrl!}
          poster={hero.videoPosterUrl}
          autoplay={hero.videoAutoplay}
        />
      ) : null}

      <div className="shop-hero-inner">
        {hero.eyebrow ? <p className="shop-hero-eyebrow">{hero.eyebrow}</p> : null}

        <h1 className="shop-hero-title">{hero.headline}</h1>

        {hero.subtitle ? <p className="shop-hero-subtitle">{hero.subtitle}</p> : null}

        {showImage ? (
          <img src={hero.imageUrl!} alt="" className="shop-hero-image" />
        ) : null}

        {hero.bodyText ? <p className="shop-hero-body">{hero.bodyText}</p> : null}

        {loggedIn ? (
          <p className="shop-hero-meta">已登录，购买后订单将同步至用户中心</p>
        ) : null}
      </div>
    </section>
  );
}
