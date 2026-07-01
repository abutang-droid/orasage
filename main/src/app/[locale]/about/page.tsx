import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageBody, PageShell, PageTitle } from '@/components/PageShell';

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <PageShell>
      <PageTitle>{t('title')}</PageTitle>
      <PageBody>
        <p>{t('p1')}</p>
        <p>{t('p2')}</p>
      </PageBody>
    </PageShell>
  );
}
