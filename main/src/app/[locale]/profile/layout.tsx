import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProfileAuthProvider } from '@/components/profile/ProfileAuth';
import { ProfileShell } from '@/components/profile/ProfileShell';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProfileLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');

  return (
    <ProfileShell>
      <ProfileAuthProvider loadingLabel={t('loading')}>{children}</ProfileAuthProvider>
    </ProfileShell>
  );
}
