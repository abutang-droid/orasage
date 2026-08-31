import type { Metadata } from 'next';
import { ProfileLegalPage } from '@/components/profile/ProfileLegalPage';
import { buildPortalPageMeta } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile.legal' });
  return buildPortalPageMeta({ locale, pathname: '/profile/about', title: t('about') });
}

export default function ProfileAboutPage({ params }: Props) {
  return <ProfileLegalPage params={params} slug="legal/about" titleKey="about" />;
}
