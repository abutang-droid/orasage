import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');

  return (
    <div>
      <p className="mb-6 text-[15px] leading-relaxed text-sage-muted sm:text-base">{t('desc')}</p>
      <ProfileDashboard />
    </div>
  );
}
