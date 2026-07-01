import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faq');
  const items = [1, 2, 3] as const;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl text-sage-gold">{t('title')}</h1>
      <div className="mt-8 space-y-6">
        {items.map((n) => (
          <div key={n} className="rounded-xl border border-sage-border bg-sage-card/60 p-6">
            <h2 className="font-medium text-white">{t(`q${n}`)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-sage-muted">{t(`a${n}`)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
