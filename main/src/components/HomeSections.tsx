'use client';

import { Icon, badgeVariants, buttonVariants, cardVariants, type IconName } from '@orasage/ui';
import type { CSSProperties, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { externalUrls } from '@/lib/urls';
import type { HomeHeroContent } from '@/lib/cms-home-hero';
import type { HomepageCatalog, ProductCategory } from '@/lib/shop-products';
import { HomeHeroVideo } from '@/components/HomeHeroVideo';
import { cn } from '@/lib/utils';

const toolKeys = ['bazi', 'ziwei', 'tarot'] as const;
const toolUrls = { bazi: externalUrls.bazi, ziwei: externalUrls.ziwei, tarot: externalUrls.tarot };
const icons: Record<(typeof toolKeys)[number], IconName> = {
  bazi: 'yinYang',
  ziwei: 'sparkles',
  tarot: 'moon',
};

const ELEMENT_STYLES: Record<string, CSSProperties> = {
  木: {
    backgroundColor: 'rgb(var(--foreground) / 0.06)',
    color: 'rgb(var(--muted-foreground))',
  },
  火: {
    backgroundColor: 'rgb(var(--foreground) / 0.08)',
    color: 'rgb(var(--muted-foreground))',
  },
  土: {
    backgroundColor: 'rgb(var(--foreground) / 0.1)',
    color: 'rgb(var(--muted-foreground))',
  },
  金: {
    backgroundColor: 'rgb(var(--foreground) / 0.08)',
    color: 'rgb(var(--muted-foreground))',
  },
  水: {
    backgroundColor: 'rgb(var(--foreground) / 0.06)',
    color: 'rgb(var(--muted-foreground))',
  },
};

const CATEGORY_STYLES: Record<ProductCategory, CSSProperties> = {
  crystal: {
    backgroundColor: 'rgb(var(--foreground) / 0.06)',
    color: 'rgb(var(--muted-foreground))',
  },
  report: {
    backgroundColor: 'rgb(var(--foreground) / 0.08)',
    color: 'rgb(var(--muted-foreground))',
  },
  service: {
    backgroundColor: 'rgb(var(--foreground) / 0.1)',
    color: 'rgb(var(--muted-foreground))',
  },
};

function ModuleTitle({ children }: { children: ReactNode }) {
  return <h2 className="home-section-title">{children}</h2>;
}

function productBadgeStyle(element?: string | null, category?: ProductCategory): CSSProperties {
  if (element && ELEMENT_STYLES[element]) return ELEMENT_STYLES[element];
  if (category && CATEGORY_STYLES[category]) return CATEGORY_STYLES[category];
  return CATEGORY_STYLES.crystal;
}

function productBadgeLabel(
  element: string | null | undefined,
  category: ProductCategory,
  categoryLabel: string,
) {
  if (element) return element;
  if (category === 'report') return '报告';
  if (category === 'service') return '咨询';
  return categoryLabel.slice(0, 2);
}

export function Hero({ hero }: { hero: HomeHeroContent }) {
  if (!hero.enabled) return null;

  const showImage = hero.displayMode === 'image' && hero.imageUrl;
  const showVideo = hero.displayMode === 'video' && hero.videoUrl;
  const mediaOnly =
    Boolean(showImage || showVideo) &&
    !hero.headline &&
    !hero.eyebrow &&
    !hero.subtitle &&
    !hero.bodyText;

  return (
    <section className="home-hero relative overflow-hidden">
      {showVideo ? (
        <HomeHeroVideo
          src={hero.videoUrl!}
          poster={hero.videoPosterUrl}
          autoplay={hero.videoAutoplay}
        />
      ) : null}

      <div
        className={`home-hero-inner orasage-fade-in relative pb-10 pt-8 text-center sm:pb-12 sm:pt-10${mediaOnly ? ' home-hero-inner--media-only' : ''}`}
      >
        {hero.eyebrow ? <p className="home-eyebrow">{hero.eyebrow}</p> : null}

        {hero.headline ? (
          <h1 className="mt-3 font-serif text-[1.75rem] font-bold leading-[var(--os-line-heading-1)] tracking-[var(--os-letter-tight)] text-foreground sm:mt-4 sm:text-heading-1">
            {hero.headline}
          </h1>
        ) : null}

        {hero.subtitle ? (
          <p className="mx-auto mt-4 max-w-lg text-sm leading-[var(--os-line-body)] tracking-[var(--os-letter-wide)] text-muted-foreground sm:text-base">
            {hero.subtitle}
          </p>
        ) : null}

        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.imageUrl!}
            alt={hero.imageAlt ?? ''}
            className="home-hero-image border border-border"
          />
        ) : null}

        {hero.bodyText ? (
          <p className="mx-auto mt-4 max-w-lg text-sm leading-[var(--os-line-body)] text-muted-foreground">
            {hero.bodyText}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ToolCards() {
  const t = useTranslations('tools');

  return (
    <section id="tools" className="home-section">
      <ModuleTitle>{t('title')}</ModuleTitle>
      <div className="flex flex-col gap-3 sm:gap-4 md:grid md:grid-cols-3 md:gap-4">
        {toolKeys.map((key, index) => (
          <a
            key={key}
            href={toolUrls[key]}
            className={cn(
              cardVariants({ variant: 'interactive' }),
              'home-tool-card group flex min-h-[80px] items-start gap-3 p-4 sm:min-h-0 sm:block sm:p-5',
            )}
          >
            <div className="flex items-start gap-3 sm:block">
              <span
                className="home-tool-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition-colors duration-fast group-hover:bg-foreground group-hover:text-background sm:mb-3 sm:h-11 sm:w-11 sm:text-2xl"
                aria-hidden
              >
                <Icon name={icons[key]} className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div className="flex-1 sm:mt-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-medium text-foreground sm:text-lg">{t(`${key}.name`)}</h3>
                  <span className="hidden font-mono text-[10px] tracking-widest text-muted-foreground/70 sm:inline">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-[var(--os-line-label)] tracking-[var(--os-letter-wide)] text-muted-foreground sm:text-sm">
                  {t(`${key}.desc`)}
                </p>
              </div>
            </div>
            <span className="self-center text-lg text-muted-foreground transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-foreground sm:hidden" aria-hidden>
              ›
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ShopSection({ catalog }: { catalog: HomepageCatalog }) {
  const t = useTranslations('shop');
  const categories = catalog.categories;
  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);

  const currentCategory = activeCategory && categories.some((c) => c.id === activeCategory)
    ? activeCategory
    : (categories[0]?.id ?? null);

  const visible = useMemo(
    () => (currentCategory ? catalog.products.filter((p) => p.category === currentCategory) : catalog.products),
    [catalog.products, currentCategory],
  );

  return (
    <section id="shop" className="home-section">
      <ModuleTitle>{t('title')}</ModuleTitle>

      <div className="home-shop-toolbar mb-5 flex items-center gap-3 sm:mb-6">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const active = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  badgeVariants({ variant: active ? 'default' : 'outline' }),
                  'min-h-9 shrink-0 cursor-pointer rounded-[var(--os-radius-btn)] px-4 text-xs tracking-[var(--os-letter-wide)]',
                )}
              >
                {t(`categories.${cat.id}`)}
              </button>
            );
          })}
        </div>
        <a
          href={externalUrls.shop}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'home-shop-more shrink-0 whitespace-nowrap',
          )}
        >
          {t('cta')} →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:gap-4">
        {visible.map((item) => (
          <a
            key={item.sku}
            href={item.shopUrl}
            className={cn(
              cardVariants({ variant: 'interactive' }),
              'home-product-card flex min-h-[148px] flex-col p-3.5 sm:min-h-[160px] sm:p-4',
            )}
          >
            {item.imageUrl ? (
              <div className="home-product-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="home-product-image"
                  loading="lazy"
                />
              </div>
            ) : (
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm"
                style={productBadgeStyle(item.element, item.category)}
              >
                {productBadgeLabel(item.element, item.category, item.categoryLabel)}
              </span>
            )}
            <h3 className="mt-2.5 text-sm font-medium leading-snug text-foreground sm:text-[15px]">
              {item.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-[var(--os-line-label)] text-muted-foreground sm:text-xs">
              {item.desc}
            </p>
            {item.priceDisplay ? (
              <p className="mt-auto pt-2 text-sm font-medium text-foreground">{item.priceDisplay}</p>
            ) : null}
          </a>
        ))}
      </div>
    </section>
  );
}

export function ContentSections() {
  const t = useTranslations('sections');

  return (
    <section className="home-section home-section--tail">
      <ModuleTitle>{t('moduleTitle')}</ModuleTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Link
          href="/famous"
          className={cn(
            cardVariants({ variant: 'interactive' }),
            'home-editorial-card group block p-5 sm:p-6',
          )}
        >
          <h3 className="font-serif text-heading-3 font-medium text-foreground">{t('famous')}</h3>
          <p className="mt-2 text-sm leading-[var(--os-line-body)] tracking-[var(--os-letter-wide)] text-muted-foreground">
            {t('famousDesc')}
          </p>
          <p className="mt-4 text-sm font-medium text-foreground transition-transform duration-fast group-hover:translate-x-0.5">
            {t('explore')} →
          </p>
        </Link>
        <Link
          href="/daozang"
          className={cn(
            cardVariants({ variant: 'interactive' }),
            'home-editorial-card group block p-5 sm:p-6',
          )}
        >
          <h3 className="font-serif text-heading-3 font-medium text-foreground">{t('daozang')}</h3>
          <p className="mt-2 text-sm leading-[var(--os-line-body)] tracking-[var(--os-letter-wide)] text-muted-foreground">
            {t('daozangDesc')}
          </p>
          <p className="mt-4 text-sm font-medium text-foreground transition-transform duration-fast group-hover:translate-x-0.5">
            {t('explore')} →
          </p>
        </Link>
      </div>
    </section>
  );
}
