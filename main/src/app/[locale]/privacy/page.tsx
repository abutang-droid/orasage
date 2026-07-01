import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageBody, PageShell, PageTitle } from '@/components/PageShell';

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('privacy');

  return (
    <PageShell>
      <PageTitle>{t('title')}</PageTitle>
      <PageBody>
        <p>{t('content')}</p>
      </PageBody>
    </PageShell>
  );
}
