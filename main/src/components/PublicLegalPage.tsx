import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { PageBody, PageShell, PageTitle } from '@/components/PageShell';
import { fetchCmsPageBySlug } from '@/lib/cms';

type Props = {
  params: Promise<{ locale: string }>;
  slug: string;
  titleKey: 'title';
  fallbackKey: 'content' | 'noBody';
  ns: 'privacy' | 'terms';
};

export async function PublicLegalPage({ params, slug, titleKey, fallbackKey, ns }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations(ns);

  const page = await fetchCmsPageBySlug(slug);
  const legacyHtml = page?.legacyHtml?.trim();

  if (!page || page.appSource !== 'main') {
    return (
      <PageShell>
        <PageTitle>{t(titleKey)}</PageTitle>
        <PageBody>
          <p>{t(fallbackKey)}</p>
        </PageBody>
      </PageShell>
    );
  }

  if (!legacyHtml) notFound();

  return (
    <PageShell>
      <PageTitle>
        <ArticleTitle>{page.title || t(titleKey)}</ArticleTitle>
      </PageTitle>
      <div className="mt-6 sm:mt-8">
        <LegacyHtmlArticle html={legacyHtml} />
      </div>
    </PageShell>
  );
}
