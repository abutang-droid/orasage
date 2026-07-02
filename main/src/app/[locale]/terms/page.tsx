import { PublicLegalPage } from '@/components/PublicLegalPage';

type Props = { params: Promise<{ locale: string }> };

export default function TermsPage({ params }: Props) {
  return (
    <PublicLegalPage
      params={params}
      slug="legal/terms"
      titleKey="title"
      fallbackKey="content"
      ns="terms"
    />
  );
}
