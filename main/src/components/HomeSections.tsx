'use client';

import { useTranslations } from 'next-intl';
import { externalUrls } from '@/lib/urls';

const toolKeys = ['bazi', 'ziwei', 'tarot'] as const;
const toolUrls = { bazi: externalUrls.bazi, ziwei: externalUrls.ziwei, tarot: externalUrls.tarot };
const icons = { bazi: '☯', ziwei: '✦', tarot: '🌙' };

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden px-4 py-20 text-center md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7f5af015_0%,_transparent_70%)]" />
      <h1 className="font-serif text-4xl font-light tracking-wide text-white md:text-6xl">
        {t('title')}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-sage-muted">{t('subtitle')}</p>
      <a
        href="#tools"
        className="mt-8 inline-block rounded-full bg-sage-purple px-8 py-3 text-sm font-medium text-white transition hover:bg-sage-purple/80"
      >
        {t('cta')}
      </a>
    </section>
  );
}

export function ToolCards() {
  const t = useTranslations('tools');

  return (
    <section id="tools" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-8 text-center font-serif text-2xl text-sage-gold">{t('title')}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {toolKeys.map((key) => (
          <a
            key={key}
            href={toolUrls[key]}
            className="group rounded-2xl border border-sage-border bg-sage-card p-8 transition hover:border-sage-purple/50 hover:shadow-lg hover:shadow-sage-purple/5"
          >
            <span className="text-3xl">{icons[key]}</span>
            <h3 className="mt-4 text-xl font-medium text-white group-hover:text-sage-gold">
              {t(`${key}.name`)}
            </h3>
            <p className="mt-2 text-sm text-sage-muted">{t(`${key}.desc`)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ContentSections() {
  const t = useTranslations('sections');

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-sage-border bg-sage-card/60 p-8">
          <h3 className="font-serif text-xl text-sage-gold">{t('famous')}</h3>
          <p className="mt-2 text-sm text-sage-muted">{t('famousDesc')}</p>
          <p className="mt-4 text-xs text-sage-purple">{t('comingSoon')}</p>
        </div>
        <div className="rounded-2xl border border-sage-border bg-sage-card/60 p-8">
          <h3 className="font-serif text-xl text-sage-gold">{t('daozang')}</h3>
          <p className="mt-2 text-sm text-sage-muted">{t('daozangDesc')}</p>
          <p className="mt-4 text-xs text-sage-purple">{t('comingSoon')}</p>
        </div>
      </div>
    </section>
  );
}
