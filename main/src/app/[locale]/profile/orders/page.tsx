import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { OrdersList } from '@/components/profile/OrdersList';
import { ProfileSection } from '@/components/profile/ProfileSection';

type Props = { params: Promise<{ locale: string }> };

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
