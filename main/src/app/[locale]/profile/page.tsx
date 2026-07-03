import { setRequestLocale } from 'next-intl/server';
import { ProfileHub } from '@/components/profile/ProfileHub';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProfileHub locale={locale} />;
}
