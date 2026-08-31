import type { Metadata } from 'next';
import { ProfileLegalPage } from '@/components/profile/ProfileLegalPage';
import { buildPortalPageMeta } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile.legal' });
  return buildPortalPageMeta({ locale, pathname: '/profile/privacy', title: t('privacy') });
}

export default function ProfilePrivacyPage({ params }: Props) {
  return <ProfileLegalPage params={params} slug="legal/privacy" titleKey="privacy" />;
}
