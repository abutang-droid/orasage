import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { MeritDetail } from '@/components/profile/MeritDetail';
import { ProfileSection } from '@/components/profile/ProfileSection';

type Props = { params: Promise<{ locale: string }> };

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
