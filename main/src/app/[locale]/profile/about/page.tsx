import { ProfileLegalPage } from '@/components/profile/ProfileLegalPage';

type Props = { params: Promise<{ locale: string }> };

export default function ProfileAboutPage({ params }: Props) {
  return <ProfileLegalPage params={params} slug="legal/about" titleKey="about" />;
}
