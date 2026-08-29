import { redirect } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

/** 兼容旧链：/profile/terms → 公开 /terms */
export default async function ProfileTermsRedirect({ params }: Props) {
  const { locale } = await params;
  redirect({ href: '/terms', locale });
}
