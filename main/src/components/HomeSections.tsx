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
      <h1 className="font-serif text-[1.75rem] font-light leading-tight tracking-wide text-white sm:text-4xl md:text-6xl">
        {t('title')}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-sage-muted sm:mt-4 sm:max-w-xl sm:text-lg">
        {t('subtitle')}
      </p>
      <a
        href="#tools"
        className="mt-6 inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-full bg-sage-purple px-8 text-base font-medium text-white active:bg-sage-purple/80 sm:mt-8 sm:w-auto sm:text-sm"
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
              <h3 className="text-lg font-medium text-white sm:text-xl">
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
