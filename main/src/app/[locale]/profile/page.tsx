import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ProfileHub } from '@/components/profile/ProfileHub';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile' });
  return buildPortalPageMeta({
    locale,
    pathname: '/profile',
    title: t('title'),
    noindex: true,
  });
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProfileHub locale={locale} />;
}
