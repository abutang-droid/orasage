import { ProfileLegalPage } from '@/components/profile/ProfileLegalPage';

type Props = { params: Promise<{ locale: string }> };

export default function ProfileTermsPage({ params }: Props) {
  return <ProfileLegalPage params={params} slug="legal/terms" titleKey="terms" />;
}
