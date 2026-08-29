import { PublicPolicyPage } from '@/components/legal/PublicPolicyPage';

type Props = { params: Promise<{ locale: string }> };

/** 公开服务条款 — 未登录可见 */
export default function TermsPage({ params }: Props) {
  return <PublicPolicyPage params={params} policy="terms" />;
}
