import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell, PageTitle } from '@/components/PageShell';

type Props = { params: Promise<{ locale: string }> };

export default async function DaozangPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('daozang');
  const tSection = await getTranslations('sections');

  return (
    <PageShell>
      <PageTitle>{t('title')}</PageTitle>
      <p className="mt-3 text-[15px] leading-relaxed text-sage-muted sm:mt-4 sm:text-base">
        {t('desc')}
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-sage-border p-10 text-center text-sm text-sage-purple sm:mt-8 sm:p-12">
        {tSection('comingSoon')}
      </div>
    </PageShell>
  );
}
