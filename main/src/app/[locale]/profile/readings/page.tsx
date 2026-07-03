import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireProfileAuth } from '@/components/profile/ProfileAuth';
import { ReadingsList } from '@/components/profile/ReadingsList';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfileReadingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.readings');

  return (
    <RequireProfileAuth locale={locale}>
      <div>
        <h2 className="font-serif text-xl text-sage-gold">{t('title')}</h2>
        <p className="mt-2 text-sm text-sage-muted">{t('desc')}</p>
        <div className="mt-4">
          <ReadingsList />
        </div>
      </div>
    </RequireProfileAuth>
  );
}
