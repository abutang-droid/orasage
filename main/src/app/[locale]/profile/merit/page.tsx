import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { MeritDetail } from '@/components/profile/MeritDetail';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { buildPrivateProfileMetadata } from '@/lib/profile-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPrivateProfileMetadata(params, '/profile/merit', 'title', 'profile.merit');
}

export default async function ProfileMeritPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.merit');

  return (
    <RequireProfileAuth locale={locale}>
      <ProfileSection title={t('title')} description={t('desc')}>
        <MeritDetail />
      </ProfileSection>
    </RequireProfileAuth>
  );
}
