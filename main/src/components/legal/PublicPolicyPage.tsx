import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { PageBody, PageShell, PageTitle } from '@/components/PageShell';
import { fetchCmsPageBySlug } from '@/lib/cms';
import { LEGAL_CMS_SLUGS, type PublicPolicyKey } from '@/lib/public-policies';

import { Separator } from '@orasage/ui';

type Props = {
  params: Promise<{ locale: string }>;
  policy: Exclude<PublicPolicyKey, 'contact'>;
};

/**
 * 公开公共政策页（隐私 / 条款 / 配送 / 退货）— 不经 profile 登录门禁。
 * 正文优先 CMS `legal/*`；缺正文时回退 i18n 短文案（privacy/terms）或「暂无内容」。
 */
export async function PublicPolicyPage({ params, policy }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tLegal = await getTranslations('profile.legal');

  const page = await fetchCmsPageBySlug(LEGAL_CMS_SLUGS[policy]).catch(() => null);
  if (page && page.appSource !== 'main') notFound();

  let fallbackTitle: string | null = null;
  let fallbackBody: string | null = null;
  if (policy === 'privacy' || policy === 'terms') {
    const t = await getTranslations(policy);
    fallbackTitle = t('title');
    fallbackBody = t('content');
  } else if (policy === 'shipping' || policy === 'returns') {
    fallbackTitle = tLegal(policy);
    fallbackBody = tLegal(`${policy}Fallback`);
  }

  const title = page?.title?.trim() || fallbackTitle || tLegal(policy);
  const legacyHtml = page?.legacyHtml?.trim();

  return (
    <PageShell>
      <PageTitle>
        <ArticleTitle>{title}</ArticleTitle>
      </PageTitle>
      <Separator className="my-4 sm:my-5" />
      {legacyHtml ? (
        <LegacyHtmlArticle html={legacyHtml} className="portal-subpage-body legal-article" />
      ) : fallbackBody ? (
        <PageBody>
          <p>{fallbackBody}</p>
        </PageBody>
      ) : (
        <PageBody>
          <p>{tLegal('noBody')}</p>
        </PageBody>
      )}
    </PageShell>
  );
}
