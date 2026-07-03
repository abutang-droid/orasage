'use client';

import { badgeVariants, buttonVariants, cardVariants } from '@orasage/ui';
import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { externalUrls } from '@/lib/urls';
import type { HomepageCatalog, ProductCategory } from '@/lib/shop-products';
import { cn } from '@/lib/utils';

const toolKeys = ['bazi', 'ziwei', 'tarot'] as const;
const toolUrls = { bazi: externalUrls.bazi, ziwei: externalUrls.ziwei, tarot: externalUrls.tarot };
const icons = { bazi: '☯', ziwei: '✦', tarot: '🌙' };

const ELEMENT_STYLES: Record<string, CSSProperties> = {
  木: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-wood) 18%, transparent)',
    color: 'var(--os-color-element-wood)',
  },
  火: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-fire) 18%, transparent)',
    color: 'var(--os-color-element-fire)',
  },
  土: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-earth) 18%, transparent)',
    color: 'var(--os-color-element-earth)',
  },
  金: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-metal) 22%, transparent)',
    color: 'var(--os-color-ink-600)',
  },
  水: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-water) 20%, transparent)',
    color: 'var(--os-color-element-water)',
  },
};

const CATEGORY_STYLES: Record<ProductCategory, CSSProperties> = {
  crystal: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-wood) 14%, transparent)',
    color: 'var(--os-color-jade-600)',
  },
  report: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-violet-500) 14%, transparent)',
    color: 'var(--os-color-violet-600)',
  },
  service: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-brass-300) 16%, transparent)',
    color: 'var(--os-color-brass-600)',
  },
};

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

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="home-hero orasage-grain relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgb(var(--brand-primary)/0.09),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_100%,rgb(var(--brand-gold)/0.07),transparent_60%)]"
        aria-hidden
      />

      <div className="home-hero-inner orasage-fade-in relative mx-auto max-w-3xl px-5 pb-8 pt-6 text-center sm:px-6 sm:pb-12 sm:pt-10 md:pb-14 md:pt-12">
        <p className="home-eyebrow">OraSage</p>

        <h1 className="mt-2 font-serif text-[1.65rem] font-light leading-[1.2] tracking-wide text-foreground sm:mt-3 sm:text-[2.5rem] md:text-[2.75rem]">
          {t('title')}
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-muted-foreground sm:text-base">
          {t('subtitle')}
        </p>

        <div
          className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-brand-gold/45 to-transparent sm:mt-6"
          aria-hidden
        />

        <a
          href="#tools"
          className={cn(buttonVariants({ size: 'lg' }), 'mt-5 w-full max-w-xs shadow-surface-1 sm:mt-6 sm:w-auto')}
        >
          {t('cta')}
        </a>
      </div>
    </section>
  );
}

export function ToolCards() {
  const t = useTranslations('tools');

  return (
    <section id="tools" className="home-section">
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
                className="home-tool-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-xl text-brand-gold transition-colors duration-fast group-hover:bg-primary/10 group-hover:text-primary sm:mb-3 sm:h-11 sm:w-11 sm:text-2xl"
                aria-hidden
              >
                {icons[key]}
              </span>
              <div className="flex-1 sm:mt-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-medium text-foreground sm:text-lg">{t(`${key}.name`)}</h3>
                  <span className="hidden font-serif text-[10px] tracking-widest text-muted-foreground/60 sm:inline">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{t(`${key}.desc`)}</p>
              </div>
            </div>
            <span className="self-center text-lg text-primary/70 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:text-primary sm:hidden" aria-hidden>
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
    <section id="shop" className="home-section home-section--band" aria-label={t('title')}>
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
          {categories.map((cat) => {
            const active = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  badgeVariants({ variant: active ? 'default' : 'outline' }),
                  'min-h-9 shrink-0 cursor-pointer rounded-full px-4 text-xs tracking-wide',
                )}
              >
                {t(`categories.${cat.id}`)}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3 md:gap-4">
        {visible.map((item) => (
          <a
            key={item.sku}
            href={item.shopUrl}
            className={cn(
              cardVariants({ variant: 'interactive' }),
              'home-product-card flex min-h-[148px] flex-col p-3.5 sm:min-h-[160px] sm:p-4',
            )}
          >
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm"
              style={productBadgeStyle(item.element, item.category)}
            >
              {productBadgeLabel(item.element, item.category, item.categoryLabel)}
            </span>
            <h3 className="mt-2.5 text-sm font-medium leading-snug text-foreground sm:text-[15px]">
              {item.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
              {item.desc}
            </p>
            {item.priceDisplay ? (
              <p className="mt-auto pt-2 text-sm font-medium text-brand-gold">{item.priceDisplay}</p>
            ) : null}
          </a>
        ))}
      </div>

      <div className="mt-5 flex justify-center sm:mt-6">
        <a
          href={externalUrls.shop}
          className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'w-full max-w-sm bg-card/80 sm:w-auto')}
        >
          {t('cta')} →
        </a>
      </div>
    </section>
  );
}

export function ContentSections() {
  const t = useTranslations('sections');

  return (
    <section className="home-section home-section--tail">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Link
          href="/famous"
          className={cn(
            cardVariants({ variant: 'interactive' }),
            'home-editorial-card group block p-5 sm:p-6',
          )}
        >
          <h3 className="font-serif text-lg text-foreground">{t('famous')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('famousDesc')}</p>
          <p className="mt-4 text-sm font-medium text-primary transition-transform duration-fast group-hover:translate-x-0.5">
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
          <h3 className="font-serif text-lg text-foreground">{t('daozang')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('daozangDesc')}</p>
          <p className="mt-4 text-sm font-medium text-primary transition-transform duration-fast group-hover:translate-x-0.5">
            {t('explore')} →
          </p>
        </Link>
      </div>
    </section>
  );
}
