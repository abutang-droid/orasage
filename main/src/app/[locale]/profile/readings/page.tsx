import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { ReadingsList } from '@/components/profile/ReadingsList';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfileReadingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.readings');

  return (
    <RequireProfileAuth locale={locale}>
      <ProfileSection title={t('title')} description={t('desc')}>
        <ReadingsList />
      </ProfileSection>
    </RequireProfileAuth>
  );
}
