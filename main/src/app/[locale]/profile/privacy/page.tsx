import { redirect } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

/** 兼容旧链：/profile/privacy → 公开 /privacy */
export default async function ProfilePrivacyRedirect({ params }: Props) {
  const { locale } = await params;
  redirect({ href: '/privacy', locale });
}
