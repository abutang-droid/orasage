import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OrdersList } from '@/components/profile/OrdersList';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfileOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.orders');

  return (
    <div>
      <h2 className="font-serif text-xl text-sage-gold">{t('title')}</h2>
      <p className="mt-2 text-sm text-sage-muted">{t('desc')}</p>
      <div className="mt-4">
        <OrdersList />
      </div>
    </div>
  );
}
