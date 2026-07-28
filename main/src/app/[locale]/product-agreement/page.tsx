import { redirect } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

/** 公开入口 → 用户中心法律页 */
export default async function ProductAgreementRedirect({ params }: Props) {
  const { locale } = await params;
  redirect({ href: '/profile/product-agreement', locale });
}
