import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { PageBody } from '@/components/PageShell';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { fetchCmsPageBySlug } from '@/lib/cms';

import { Separator } from '@orasage/ui';
type Props = {
  params: Promise<{ locale: string }>;
  slug: string;
  titleKey: string;
};

export async function ProfileLegalPage({ params, slug, titleKey }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.legal');

  const page = await fetchCmsPageBySlug(slug);
  if (!page || page.appSource !== 'main') notFound();

  const legacyHtml = page.legacyHtml?.trim();

  return (
    <ProfileSection title={<ArticleTitle>{page.title || t(titleKey)}</ArticleTitle>}>
      <Separator className="my-2 sm:my-4" />
      {legacyHtml ? (
        <LegacyHtmlArticle html={legacyHtml} className="portal-subpage-body legal-article" />
      ) : (
        <PageBody>
          <p>{t('noBody')}</p>
        </PageBody>
      )}
    </ProfileSection>
  );
}
