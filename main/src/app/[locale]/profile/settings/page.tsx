import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { buildPrivateProfileMetadata } from '@/lib/profile-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPrivateProfileMetadata(params, '/profile/settings', 'title', 'profile.settings');
}

export default async function ProfileSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.settings');

  return (
    <ProfileSection title={t('title')} description={t('desc')}>
      <ProfileSettings locale={locale} />
    </ProfileSection>
  );
}
