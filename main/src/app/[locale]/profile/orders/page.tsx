import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { OrdersList } from '@/components/profile/OrdersList';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { buildPrivateProfileMetadata } from '@/lib/profile-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPrivateProfileMetadata(params, '/profile/orders', 'title', 'profile.orders');
}

export default async function ProfileOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.orders');

  return (
    <RequireProfileAuth locale={locale}>
      <ProfileSection title={t('title')} description={t('desc')}>
        <OrdersList />
      </ProfileSection>
    </RequireProfileAuth>
  );
}
