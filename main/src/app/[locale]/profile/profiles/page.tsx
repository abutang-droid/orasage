import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { ProfilesList } from '@/components/profile/ProfilesList';

type Props = { params: Promise<{ locale: string }> };

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
