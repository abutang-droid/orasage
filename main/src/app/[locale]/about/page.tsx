import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl text-sage-gold">{t('title')}</h1>
      <p className="mt-6 leading-relaxed text-sage-muted">{t('p1')}</p>
      <p className="mt-4 leading-relaxed text-sage-muted">{t('p2')}</p>
    </article>
  );
}
