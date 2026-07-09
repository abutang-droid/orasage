import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { TicketsList } from '@/components/profile/TicketsList';
import { ProfileSection } from '@/components/profile/ProfileSection';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfileTicketsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.tickets');

  return (
    <RequireProfileAuth locale={locale}>
      <ProfileSection title={t('title')} description={t('desc')}>
        <TicketsList />
      </ProfileSection>
    </RequireProfileAuth>
  );
}
