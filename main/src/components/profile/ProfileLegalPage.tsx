import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { PageBody } from '@/components/PageShell';
import { ProfileSection } from '@/components/profile/ProfileSection';
import {
  fetchCmsPageBySlug,
  fetchLegalAgreement,
  type LegalAgreementKind,
} from '@/lib/cms';

import { Separator } from '@orasage/ui';

type BaseProps = {
  params: Promise<{ locale: string }>;
  titleKey: string;
};

type KindProps = BaseProps & {
  kind: LegalAgreementKind;
  slug?: never;
};

type SlugProps = BaseProps & {
  slug: string;
  kind?: never;
};

type Props = KindProps | SlugProps;

export async function ProfileLegalPage(props: Props) {
  const { params, titleKey } = props;
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile.legal');

  let title = '';
  let body = '';

  if ('kind' in props && props.kind) {
    const doc = await fetchLegalAgreement(props.kind, locale);
    if (!doc) notFound();
    title = doc.title;
    body = doc.bodyHtml?.trim() ?? '';
  } else if ('slug' in props && props.slug) {
    const page = await fetchCmsPageBySlug(props.slug);
    if (!page || page.appSource !== 'main') notFound();
    title = page.title;
    body = page.legacyHtml?.trim() ?? '';
  } else {
    notFound();
  }

  return (
    <ProfileSection title={<ArticleTitle>{title || t(titleKey)}</ArticleTitle>}>
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
