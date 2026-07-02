import { ProfileLegalPage } from '@/components/profile/ProfileLegalPage';

type Props = { params: Promise<{ locale: string }> };

export default function ProfilePrivacyPage({ params }: Props) {
  return <ProfileLegalPage params={params} slug="legal/privacy" titleKey="privacy" />;
}
