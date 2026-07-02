import { ProfileLegalPage } from '@/components/profile/ProfileLegalPage';

type Props = { params: Promise<{ locale: string }> };

export default function ProfileContactPage({ params }: Props) {
  return <ProfileLegalPage params={params} slug="legal/contact" titleKey="contact" />;
}
