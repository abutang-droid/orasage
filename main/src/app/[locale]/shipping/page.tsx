import { PublicPolicyPage } from '@/components/legal/PublicPolicyPage';

type Props = { params: Promise<{ locale: string }> };

/** 公开配送政策 — 未登录可见 */
export default function ShippingPolicyPage({ params }: Props) {
  return <PublicPolicyPage params={params} policy="shipping" />;
}
