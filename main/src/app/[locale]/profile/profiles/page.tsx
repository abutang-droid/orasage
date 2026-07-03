import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { ProfilesList } from '@/components/profile/ProfilesList';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfileProfilesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.profiles');

  return (
    <RequireProfileAuth locale={locale}>
      <div>
        <h2 className="font-serif text-xl text-sage-gold">{t('title')}</h2>
        <p className="mt-2 text-sm text-sage-muted">{t('desc')}</p>
        <div className="mt-4">
          <ProfilesList />
        </div>
      </div>
    </RequireProfileAuth>
  );
}
