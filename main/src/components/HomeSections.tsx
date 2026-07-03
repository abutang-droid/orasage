'use client';

import { badgeVariants, buttonVariants, cardVariants } from '@orasage/ui';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { externalUrls } from '@/lib/urls';
import { cn } from '@/lib/utils';

const toolKeys = ['bazi', 'ziwei', 'tarot'] as const;
const toolUrls = { bazi: externalUrls.bazi, ziwei: externalUrls.ziwei, tarot: externalUrls.tarot };
const icons = { bazi: '☯', ziwei: '✦', tarot: '🌙' };

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="home-eyebrow" aria-hidden>
      {children}
    </p>
  );
}

function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('font-serif text-[1.35rem] font-medium tracking-wide text-foreground sm:text-2xl', className)}>
      {children}
    </h2>
  );
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

      <div className="home-hero-inner orasage-fade-in relative mx-auto max-w-3xl px-5 pb-14 pt-10 text-center sm:px-6 sm:pb-20 sm:pt-16 md:pb-28 md:pt-20">
        <SectionEyebrow>OraSage</SectionEyebrow>

        <h1 className="mt-3 font-serif text-[1.85rem] font-light leading-[1.2] tracking-wide text-foreground sm:mt-4 sm:text-[2.75rem] md:text-5xl">
          {t('title')}
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-[1.75] text-muted-foreground sm:mt-5 sm:text-lg sm:leading-relaxed">
          {t('subtitle')}
        </p>

        <div
          className="mx-auto mt-7 h-px w-16 bg-gradient-to-r from-transparent via-brand-gold/45 to-transparent sm:mt-8"
          aria-hidden
        />

        <a
          href="#tools"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'mt-7 w-full max-w-xs shadow-surface-1 sm:mt-8 sm:w-auto',
          )}
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
      <div className="home-section-head">
        <SectionEyebrow>{t('title')}</SectionEyebrow>
        <SectionTitle className="mt-2 text-center">{t('title')}</SectionTitle>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:gap-5 md:grid md:grid-cols-3 md:gap-6">
        {toolKeys.map((key, index) => (
          <a
            key={key}
            href={toolUrls[key]}
            className={cn(
              cardVariants({ variant: 'interactive' }),
              'home-tool-card group flex min-h-[92px] items-start gap-4 p-5 sm:min-h-0 sm:block sm:p-7',
            )}
          >
            <div className="flex items-start gap-4 sm:block">
              <span
                className="home-tool-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-2xl text-brand-gold transition-colors duration-fast group-hover:bg-primary/10 group-hover:text-primary sm:mb-5 sm:h-14 sm:w-14 sm:text-3xl"
                aria-hidden
              >
                {icons[key]}
              </span>
              <div className="flex-1 sm:mt-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg font-medium text-foreground sm:text-xl">{t(`${key}.name`)}</h3>
                  <span className="hidden font-serif text-xs tracking-widest text-muted-foreground/60 sm:inline">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(`${key}.desc`)}</p>
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

const productKeys = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
const elementStyles: Record<(typeof productKeys)[number], CSSProperties> = {
  wood: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-wood) 18%, transparent)',
    color: 'var(--os-color-element-wood)',
  },
  fire: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-fire) 18%, transparent)',
    color: 'var(--os-color-element-fire)',
  },
  earth: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-earth) 18%, transparent)',
    color: 'var(--os-color-element-earth)',
  },
  metal: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-metal) 22%, transparent)',
    color: 'var(--os-color-ink-600)',
  },
  water: {
    backgroundColor: 'color-mix(in srgb, var(--os-color-element-water) 20%, transparent)',
    color: 'var(--os-color-element-water)',
  },
};

export function ShopSection({ catalog }: { catalog?: Array<{ sku: string; shopUrl: string; priceDisplay?: string }> }) {
  const t = useTranslations('shop');
  const catalogBySku = new Map(catalog?.map((c) => [c.sku, c]));

  return (
    <section id="shop" className="home-section home-section--band">
      <div className="home-section-head">
        <SectionEyebrow>{t('title')}</SectionEyebrow>
        <SectionTitle className="mt-2 text-center">{t('title')}</SectionTitle>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('subtitle')}
        </p>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-8 sm:justify-center">
        {(['crystal', 'report', 'service'] as const).map((cat, i) => (
          <span
            key={cat}
            className={cn(
              badgeVariants({ variant: i === 0 ? 'default' : 'muted' }),
              'min-h-9 shrink-0 rounded-full px-4 text-xs tracking-wide',
            )}
          >
            {t(`categories.${cat}`)}
          </span>
        ))}
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-5 sm:overflow-visible">
        {productKeys.map((key) => {
          const skuMap = {
            wood: 'crystal-wood',
            fire: 'crystal-fire',
            earth: 'crystal-earth',
            metal: 'crystal-metal',
            water: 'crystal-water',
          } as const;
          const sku = skuMap[key];
          const item = catalogBySku.get(sku);
          const href = item?.shopUrl ?? `${externalUrls.shop}?sku=${sku}`;
          return (
            <a
              key={key}
              href={href}
              className={cn(
                cardVariants({ variant: 'interactive' }),
                'home-product-card flex w-[148px] shrink-0 flex-col p-4 sm:w-auto sm:p-5',
              )}
            >
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold"
                style={elementStyles[key]}
              >
                {t(`products.${key}.element`)}
              </span>
              <h3 className="mt-3 text-[15px] font-medium leading-snug text-foreground">
                {t(`products.${key}.name`)}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(`products.${key}.desc`)}</p>
              {item?.priceDisplay ? (
                <p className="mt-auto pt-3 text-sm font-medium text-brand-gold">{item.priceDisplay}</p>
              ) : null}
            </a>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center sm:mt-10">
        <a
          href={externalUrls.shop}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full max-w-sm bg-card/80 sm:w-auto')}
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
      <div className="home-section-head">
        <SectionEyebrow>OraSage</SectionEyebrow>
        <SectionTitle className="mt-2 text-center">{t('famous')} · {t('daozang')}</SectionTitle>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:gap-5 md:grid md:grid-cols-2 md:gap-6">
        <Link
          href="/famous"
          className={cn(
            cardVariants({ variant: 'interactive' }),
            'home-editorial-card group block p-6 sm:p-8',
          )}
        >
          <h3 className="font-serif text-xl text-foreground">{t('famous')}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{t('famousDesc')}</p>
          <p className="mt-5 text-sm font-medium text-primary transition-transform duration-fast group-hover:translate-x-0.5">
            {t('explore')} →
          </p>
        </Link>
        <Link
          href="/daozang"
          className={cn(
            cardVariants({ variant: 'interactive' }),
            'home-editorial-card group block p-6 sm:p-8',
          )}
        >
          <h3 className="font-serif text-xl text-foreground">{t('daozang')}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{t('daozangDesc')}</p>
          <p className="mt-5 text-sm font-medium text-primary transition-transform duration-fast group-hover:translate-x-0.5">
            {t('explore')} →
          </p>
        </Link>
      </div>
    </section>
  );
}
