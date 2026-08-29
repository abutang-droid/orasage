import { PublicPolicyPage } from '@/components/legal/PublicPolicyPage';

type Props = { params: Promise<{ locale: string }> };

/** 公开隐私政策 — 未登录可见 */
export default function PrivacyPage({ params }: Props) {
  return <PublicPolicyPage params={params} policy="privacy" />;
}
