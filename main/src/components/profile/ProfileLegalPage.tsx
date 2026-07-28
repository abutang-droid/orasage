import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { PageBody } from '@/components/PageShell';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { fetchLegalAgreement, type LegalAgreementKind } from '@/lib/cms';

import { Separator } from '@orasage/ui';

type Props = {
  params: Promise<{ locale: string }>;
  kind: LegalAgreementKind;
  titleKey: 'privacy' | 'terms' | 'product';
};

export async function ProfileLegalPage({ params, kind, titleKey }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.legal');

  const doc = await fetchLegalAgreement(kind, locale);
  if (!doc) notFound();

  const body = doc.bodyHtml?.trim();

  return (
    <ProfileSection title={<ArticleTitle>{doc.title || t(titleKey)}</ArticleTitle>}>
      <Separator className="my-2 sm:my-4" />
      {body ? (
        <LegacyHtmlArticle html={body} className="portal-subpage-body legal-article" />
      ) : (
        <PageBody>
          <p>{t('noBody')}</p>
        </PageBody>
      )}
    </ProfileSection>
  );
}
