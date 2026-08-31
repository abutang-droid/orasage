import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { RecommendationsList } from '@/components/profile/RecommendationsList';
import { buildPrivateProfileMetadata } from '@/lib/profile-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPrivateProfileMetadata(params, '/profile/recommendations', 'title', 'profile.recommendations');
}

export default async function ProfileRecommendationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.recommendations');

  return (
    <RequireProfileAuth locale={locale}>
      <ProfileSection title={t('title')} description={t('desc')}>
        <RecommendationsList />
      </ProfileSection>
    </RequireProfileAuth>
  );
}
