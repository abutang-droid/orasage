import { PublicLegalPage } from '@/components/PublicLegalPage';

type Props = { params: Promise<{ locale: string }> };

export default function PrivacyPage({ params }: Props) {
  return (
    <PublicLegalPage
      params={params}
      slug="legal/privacy"
      titleKey="title"
      fallbackKey="content"
      ns="privacy"
    />
  );
}
