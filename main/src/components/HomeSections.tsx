'use client';

import { useTranslations } from 'next-intl';
import { externalUrls } from '@/lib/urls';

const toolKeys = ['bazi', 'ziwei', 'tarot'] as const;
const toolUrls = { bazi: externalUrls.bazi, ziwei: externalUrls.ziwei, tarot: externalUrls.tarot };
const icons = { bazi: '☯', ziwei: '✦', tarot: '🌙' };

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-8 text-center sm:px-6 sm:py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7f5af015_0%,_transparent_70%)]" />
      <h1 className="font-serif text-[1.75rem] font-light leading-tight tracking-wide text-sage-primary sm:text-4xl md:text-6xl">
        {t('title')}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-sage-muted sm:mt-4 sm:max-w-xl sm:text-lg">
        {t('subtitle')}
      </p>
      <a
        href="#tools"
        className="mt-6 inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-full bg-sage-gold px-8 text-base font-medium text-white active:bg-sage-gold/80 sm:mt-8 sm:w-auto sm:text-sm"
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
      <h2 className="mb-5 text-center font-serif text-xl text-sage-gold sm:mb-8 sm:text-2xl">
        {t('title')}
      </h2>
      <div className="flex flex-col gap-4 sm:gap-6 md:grid md:grid-cols-3">
        {toolKeys.map((key) => (
          <a
            key={key}
            href={toolUrls[key]}
            className="group flex min-h-[88px] items-start gap-4 rounded-2xl border border-sage-border bg-sage-card p-5 active:border-sage-purple/50 active:bg-sage-card/80 sm:block sm:p-8 md:hover:border-sage-purple/50"
          >
            <span className="text-3xl sm:block">{icons[key]}</span>
            <div className="flex-1 sm:mt-4">
              <h3 className="text-lg font-medium text-sage-primary sm:text-xl">
                {t(`${key}.name`)}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-sage-muted">
                {t(`${key}.desc`)}
              </p>
            </div>
            <span className="self-center text-sage-muted sm:hidden" aria-hidden>›</span>
          </a>
        ))}
      </div>
    </section>
  );
}

const productKeys = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
const productSkus: Record<(typeof productKeys)[number], string> = {
  wood: 'crystal-wood',
  fire: 'crystal-fire',
  earth: 'crystal-earth',
  metal: 'crystal-metal',
  water: 'crystal-water',
};
const elementColors: Record<string, string> = {
  wood: 'bg-emerald-500/20 text-emerald-300',
  fire: 'bg-red-500/20 text-red-300',
  earth: 'bg-amber-500/20 text-amber-300',
  metal: 'bg-slate-300/20 text-slate-200',
  water: 'bg-indigo-500/20 text-indigo-300',
};

export function ShopSection() {
  const t = useTranslations('shop');

  return (
    <section id="shop" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-5 text-center sm:mb-8">
        <h2 className="font-serif text-xl text-sage-gold sm:text-2xl">{t('title')}</h2>
        <p className="mt-2 text-sm text-sage-muted sm:text-base">{t('subtitle')}</p>
      </div>

      {/* 分类标签 */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
        {(['crystal', 'report', 'service'] as const).map((cat) => (
          <span
            key={cat}
            className="shrink-0 rounded-full border border-sage-border bg-sage-card px-4 py-2 text-xs text-sage-muted"
          >
            {t(`categories.${cat}`)}
          </span>
        ))}
      </div>

      {/* 水晶产品 — 手机横向滑动 */}
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-5 sm:overflow-visible">
        {productKeys.map((key) => (
          <a
            key={key}
            href={`${externalUrls.shop}?sku=${productSkus[key]}`}
            className="flex w-[140px] shrink-0 flex-col rounded-2xl border border-sage-border bg-sage-card p-4 active:border-sage-gold/40 sm:w-auto"
          >
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${elementColors[key]}`}
            >
              {t(`products.${key}.element`)}
            </span>
            <h3 className="mt-3 text-base font-medium text-sage-primary">
              {t(`products.${key}.name`)}
            </h3>
            <p className="mt-1 text-xs text-sage-muted">{t(`products.${key}.desc`)}</p>
          </a>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-sage-muted sm:mt-6">{t('hint')}</p>

      <div className="mt-5 flex justify-center sm:mt-6">
        <a
          href={externalUrls.shop}
          className="inline-flex min-h-[48px] w-full max-w-sm items-center justify-center rounded-full border border-sage-gold/50 bg-sage-gold/10 px-8 text-base font-medium text-sage-gold active:bg-sage-gold/20 sm:w-auto sm:text-sm"
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
        <div className="rounded-2xl border border-sage-border bg-sage-card/60 p-5 sm:p-8">
          <h3 className="font-serif text-lg text-sage-gold sm:text-xl">{t('famous')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-sage-muted">{t('famousDesc')}</p>
          <p className="mt-3 text-xs text-sage-purple sm:mt-4">{t('comingSoon')}</p>
        </div>
        <div className="rounded-2xl border border-sage-border bg-sage-card/60 p-5 sm:p-8">
          <h3 className="font-serif text-lg text-sage-gold sm:text-xl">{t('daozang')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-sage-muted">{t('daozangDesc')}</p>
          <p className="mt-3 text-xs text-sage-purple sm:mt-4">{t('comingSoon')}</p>
        </div>
      </div>
    </section>
  );
}
