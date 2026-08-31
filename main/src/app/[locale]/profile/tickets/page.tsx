import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { TicketsList } from '@/components/profile/TicketsList';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { buildPrivateProfileMetadata } from '@/lib/profile-metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildPrivateProfileMetadata(params, '/profile/tickets', 'title', 'profile.tickets');
}

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
