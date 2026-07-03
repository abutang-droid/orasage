'use client';

import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { externalUrls } from '@/lib/urls';
import { buttonVariants } from '@/components/ui/button';
import { badgeVariants } from '@/components/ui/badge';
import { cardVariants } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const toolKeys = ['bazi', 'ziwei', 'tarot'] as const;
const toolUrls = { bazi: externalUrls.bazi, ziwei: externalUrls.ziwei, tarot: externalUrls.tarot };
const icons = { bazi: '☯', ziwei: '✦', tarot: '🌙' };

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-8 text-center sm:px-6 sm:py-20 md:py-28">
      <h1 className="font-serif text-[1.75rem] font-light leading-tight tracking-wide text-foreground sm:text-4xl md:text-6xl">
        {t('title')}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:max-w-xl sm:text-lg">
        {t('subtitle')}
      </p>
      <a
        href="#tools"
        className={cn(buttonVariants({ size: 'lg' }), 'mt-6 w-full max-w-xs sm:mt-8 sm:w-auto')}
      >
        {t('cta')}
      </a>
    </section>
  );
}

export function ToolCards() {
  const t = useTranslations('tools');

  return (
    <section id="tools" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="mb-5 text-center font-serif text-xl text-foreground sm:mb-8 sm:text-2xl">
        {t('title')}
      </h2>
      <div className="flex flex-col gap-4 sm:gap-6 md:grid md:grid-cols-3">
        {toolKeys.map((key) => (
          <a
            key={key}
            href={toolUrls[key]}
            className={cn(
              cardVariants({ variant: 'interactive' }),
              'group flex min-h-[88px] items-start gap-4 p-5 active:border-primary/60 active:bg-primary/5 sm:block sm:p-8',
            )}
          >
            <span className="text-3xl text-brand-gold sm:block">{icons[key]}</span>
            <div className="flex-1 sm:mt-4">
              <h3 className="text-lg font-medium text-foreground sm:text-xl">
                {t(`${key}.name`)}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(`${key}.desc`)}
              </p>
            </div>
            <span className="self-center text-primary sm:hidden" aria-hidden>›</span>
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
    <section id="shop" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-5 text-center sm:mb-8">
        <h2 className="font-serif text-xl text-foreground sm:text-2xl">{t('title')}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t('subtitle')}</p>
      </div>

      {/* 分类标签 */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
        {(['crystal', 'report', 'service'] as const).map((cat) => (
          <span
            key={cat}
            className={cn(badgeVariants({ variant: 'muted' }), 'min-h-9 shrink-0 rounded-md px-4')}
          >
            {t(`categories.${cat}`)}
          </span>
        ))}
      </div>

      {/* 水晶产品 — 手机横向滑动 */}
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-5 sm:overflow-visible">
        {productKeys.map((key) => {
          const skuMap = { wood: 'crystal-wood', fire: 'crystal-fire', earth: 'crystal-earth', metal: 'crystal-metal', water: 'crystal-water' } as const;
          const sku = skuMap[key];
          const item = catalogBySku.get(sku);
          const href = item?.shopUrl ?? `${externalUrls.shop}?sku=${sku}`;
          return (
          <a
            key={key}
            href={href}
            className={cn(
              cardVariants({ variant: 'interactive' }),
              'flex w-[140px] shrink-0 flex-col p-4 active:border-primary/60 active:bg-primary/5 sm:w-auto',
            )}
          >
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
              style={elementStyles[key]}
            >
              {t(`products.${key}.element`)}
            </span>
            <h3 className="mt-3 text-base font-medium text-foreground">
              {t(`products.${key}.name`)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{t(`products.${key}.desc`)}</p>
            {item?.priceDisplay ? (
              <p className="mt-2 text-sm font-medium text-brand-gold">{item.priceDisplay}</p>
            ) : null}
          </a>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground sm:mt-6">{t('hint')}</p>

      <div className="mt-5 flex justify-center sm:mt-6">
        <a
          href={externalUrls.shop}
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full max-w-sm sm:w-auto')}
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
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:gap-6 md:grid md:grid-cols-2">
        <Link
          href="/famous"
          className={cn(
            cardVariants({ variant: 'interactive' }),
            'group block p-5 active:border-primary/60 active:bg-primary/5 sm:p-8',
          )}
        >
          <h3 className="font-serif text-lg text-foreground sm:text-xl">{t('famous')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('famousDesc')}</p>
          <p className="mt-3 text-sm text-primary sm:mt-4">{t('explore')} →</p>
        </Link>
        <Link
          href="/daozang"
          className={cn(
            cardVariants({ variant: 'interactive' }),
            'group block p-5 active:border-primary/60 active:bg-primary/5 sm:p-8',
          )}
        >
          <h3 className="font-serif text-lg text-foreground sm:text-xl">{t('daozang')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('daozangDesc')}</p>
          <p className="mt-3 text-sm text-primary sm:mt-4">{t('explore')} →</p>
        </Link>
      </div>
    </section>
  );
}
