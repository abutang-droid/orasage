import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell, PageTitle } from '@/components/PageShell';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { fetchCmsPageBySlug } from '@/lib/cms';

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export default async function FamousArticlePage({ params }: Props) {
  const { locale, slug: slugParts } = await params;
  const slug = slugParts.join('/');
  setRequestLocale(locale);
  const t = await getTranslations('famous');

  const page = await fetchCmsPageBySlug(slug);
  if (!page || page.appSource !== 'famous') notFound();

  const legacyHtml = page.legacyHtml?.trim();

  return (
    <PageShell>
      <PageTitle>
        <ArticleTitle>{page.title}</ArticleTitle>
      </PageTitle>
      {page.sourceUrl && (
        <p className="mt-2 text-sm text-sage-purple">
          <a href={page.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-sage-gold">
            {t('sourceLink')}
          </a>
        </p>
      )}
      <div className="mt-6 sm:mt-8">
        {legacyHtml ? (
          <LegacyHtmlArticle html={legacyHtml} />
        ) : (
          <p className="text-sage-muted">{t('noBody')}</p>
        )}
      </div>
    </PageShell>
  );
}
