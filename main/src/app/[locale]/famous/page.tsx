import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function FamousPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('famous');
  const tSection = await getTranslations('sections');

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-3xl text-sage-gold">{t('title')}</h1>
      <p className="mt-4 text-sage-muted">{t('desc')}</p>
      <div className="mt-8 rounded-xl border border-dashed border-sage-border p-12 text-center text-sm text-sage-purple">
        {tSection('comingSoon')}
      </div>
    </article>
  );
}
