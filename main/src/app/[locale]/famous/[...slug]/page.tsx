import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell, PageTitle } from '@/components/PageShell';
import { ArticleTitle, LegacyHtmlArticle } from '@/components/LegacyHtmlArticle';
import { FamousArticleCta } from '@/components/famous/FamousArticleCta';
import { fetchCmsPageBySlug } from '@/lib/cms';
import { prepareFamousArticle } from '@/lib/famous-meta';

import { Alert, AlertDescription, Separator } from '@orasage/ui';
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
  const article = legacyHtml ? prepareFamousArticle(legacyHtml) : null;

  return (
    <PageShell>
      {/* 正文自带封面（含人名大标题）时不再重复渲染页面级标题 */}
      {!article?.hasCover && (
        <>
          <header>
            <PageTitle>
              <ArticleTitle>{page.title}</ArticleTitle>
            </PageTitle>
          </header>
          <Separator className="my-6 sm:my-8" />
        </>
      )}

      {article && article.anchors.length > 0 && (
        <nav
          aria-label={t('toc')}
          className="sticky top-0 z-20 -mx-5 mb-5 border-b border-border/80 bg-background/95 px-5 backdrop-blur-sm sm:-mx-6 sm:px-6"
        >
          <div className="flex gap-1.5 overflow-x-auto py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {article.anchors.map((anchor) => (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                className="whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {anchor.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {article ? (
        <LegacyHtmlArticle html={article.html} className="famous-article portal-subpage-body" />
      ) : (
        <Alert>
          <AlertDescription>{t('noBody')}</AlertDescription>
        </Alert>
      )}

      <FamousArticleCta sourceUrl={page.sourceUrl} />
    </PageShell>
  );
}
