import { PublicPolicyPage } from '@/components/legal/PublicPolicyPage';

type Props = { params: Promise<{ locale: string }> };

/** 公开退货/退款政策 — 未登录可见 */
export default function ReturnsPolicyPage({ params }: Props) {
  return <PublicPolicyPage params={params} policy="returns" />;
}
