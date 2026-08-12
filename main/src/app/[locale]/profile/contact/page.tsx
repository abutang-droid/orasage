import { redirect } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

/** 兼容旧链：/profile/contact → 公开 /contact */
export default async function ProfileContactRedirect({ params }: Props) {
  const { locale } = await params;
  redirect({ href: '/contact', locale });
}
