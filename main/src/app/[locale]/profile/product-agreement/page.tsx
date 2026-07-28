import { ProfileLegalPage } from '@/components/profile/ProfileLegalPage';

type Props = { params: Promise<{ locale: string }> };

export default function ProfileProductAgreementPage({ params }: Props) {
  return <ProfileLegalPage params={params} kind="product" titleKey="product" />;
}
