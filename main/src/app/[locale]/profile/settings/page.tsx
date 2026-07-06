import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { ProfileSection } from '@/components/profile/ProfileSection';

type Props = { params: Promise<{ locale: string }> };

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
