import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { ProfilesList } from '@/components/profile/ProfilesList';
import { buildPrivateProfileMetadata } from '@/lib/profile-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPrivateProfileMetadata(params, '/profile/profiles', 'title', 'profile.profiles');
}

export default async function ProfileProfilesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.profiles');

  return (
    <RequireProfileAuth locale={locale}>
      <ProfileSection title={t('title')} description={t('desc')}>
        <ProfilesList />
      </ProfileSection>
    </RequireProfileAuth>
  );
}
