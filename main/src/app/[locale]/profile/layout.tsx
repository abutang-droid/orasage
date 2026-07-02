import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell, PageTitle } from '@/components/PageShell';
import { ProfileGate } from '@/components/profile/ProfileGate';
import { ProfileNav } from '@/components/profile/ProfileNav';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProfileLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');

  return (
    <PageShell>
      <PageTitle>{t('title')}</PageTitle>
      <ProfileGate locale={locale} loadingLabel={t('loading')}>
        <div className="mt-6">
          <ProfileNav />
          {children}
        </div>
      </ProfileGate>
    </PageShell>
  );
}
