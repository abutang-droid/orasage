import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle } from '@/components/PageShell';
import { ArticleTitle } from '@/components/LegacyHtmlArticle';
import {
  cmsLocale,
  decodeHtmlEntities,
  daozangArticlePath,
  fetchCmsPageBySlug,
  fetchDaozangIndex,
  sanitizeLegacyHtml,
  stripHtml,
} from '@/lib/cms';
import { compareArticles, resolveArticleCategory } from '@/lib/daozang-taxonomy';
import { injectHeadingAnchors, stripLeadingTitleHeading } from '@/lib/html-toc';
import { DaozangBreadcrumb } from '../components';

import { Alert, AlertDescription, Badge, Card, CardContent, Separator, buttonVariants } from '@orasage/ui';

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug: slugParts } = await params;
  const slug = slugParts.map(decodeURIComponent).join('/');
  const page = await fetchCmsPageBySlug(slug);
  if (!page || page.appSource !== 'daozang') return {};
  const t = await getTranslations({ locale, namespace: 'daozang' });
  const description = page.excerpt ?? (page.legacyHtml ? stripHtml(page.legacyHtml) : undefined);
  return {
    title: `${decodeHtmlEntities(page.title)} · ${t('title')}`,
    description,
  };
}

export default async function DaozangArticlePage({ params }: Props) {
  const { locale, slug: slugParts } = await params;
  const slug = slugParts.map(decodeURIComponent).join('/');
  setRequestLocale(locale);
  const t = await getTranslations('daozang');

  const page = await fetchCmsPageBySlug(slug);
  if (!page || page.appSource !== 'daozang') notFound();

  const category = resolveArticleCategory(page);
  const categoryLabel = category
    ? `${t(`tops.${category.top}.name`)} · ${t(`categories.${category.key}`)}`
    : null;

  // 同分类上下篇（轻量索引，失败时静默降级）
  let prevArticle: { title: string; slug: string } | null = null;
  let nextArticle: { title: string; slug: string } | null = null;
  if (category) {
    try {
      const index = await fetchDaozangIndex(cmsLocale(locale));
      const siblings = index
        .filter((item) => resolveArticleCategory(item)?.key === category.key)
        .sort(compareArticles);
      const position = siblings.findIndex((item) => item.slug === page.slug);
      if (position > 0) prevArticle = siblings[position - 1];
      if (position >= 0 && position < siblings.length - 1) nextArticle = siblings[position + 1];
    } catch {
      // 索引不可用时不展示上下篇
    }
  }

  const rawHtml = page.legacyHtml?.trim();
  const article = rawHtml
    ? injectHeadingAnchors(stripLeadingTitleHeading(sanitizeLegacyHtml(rawHtml), page.title))
    : null;
  const showToc = (article?.headings.length ?? 0) >= 3;

  return (
    <PageShell hideBack>
      <DaozangBreadcrumb
        items={[
          { label: t('title'), href: '/daozang' },
          ...(category && categoryLabel
            ? [{ label: categoryLabel, href: `/daozang?cat=${category.key}` }]
            : []),
          { label: decodeHtmlEntities(page.title) },
        ]}
      />

      <header>
        <PageTitle>
          <ArticleTitle>{page.title}</ArticleTitle>
        </PageTitle>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {categoryLabel && category && (
            <Link href={`/daozang?cat=${category.key}`}>
              <Badge variant="muted">{categoryLabel}</Badge>
            </Link>
          )}
          {page.sourceUrl && (
            <a
              href={page.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {t('sourceLink')}
            </a>
          )}
        </div>
      </header>

      <Separator className="my-6 sm:my-8" />

      {showToc && article && (
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-5 sm:p-6">
            <details open={article.headings.length <= 24}>
              <summary className="cursor-pointer select-none text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {t('toc')}
              </summary>
              <ol className="mt-3 grid max-h-72 gap-1.5 overflow-y-auto text-sm sm:grid-cols-2">
                {article.headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          </CardContent>
        </Card>
      )}

      {article ? (
        <article
          className="legacy-html-article prose-sage break-words portal-subpage-body"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      ) : (
        <Alert>
          <AlertDescription>{t('noBody')}</AlertDescription>
        </Alert>
      )}

      {(prevArticle || nextArticle) && (
        <nav
          className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2 sm:gap-4"
          aria-label={t('siblingNav')}
        >
          {prevArticle ? (
            <Card variant="interactive" asChild>
              <Link href={daozangArticlePath(prevArticle.slug)} className="group block h-full">
                <CardContent className="p-4 sm:p-5">
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                    {t('prevArticle')}
                  </p>
                  <p className="mt-1.5 font-serif font-medium text-foreground transition-colors group-hover:text-foreground/80">
                    {decodeHtmlEntities(prevArticle.title)}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ) : (
            <span className="hidden sm:block" />
          )}
          {nextArticle && (
            <Card variant="interactive" asChild>
              <Link href={daozangArticlePath(nextArticle.slug)} className="group block h-full">
                <CardContent className="p-4 sm:p-5 sm:text-end">
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground sm:justify-end">
                    {t('nextArticle')}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                  </p>
                  <p className="mt-1.5 font-serif font-medium text-foreground transition-colors group-hover:text-foreground/80">
                    {decodeHtmlEntities(nextArticle.title)}
                  </p>
                </CardContent>
              </Link>
            </Card>
          )}
        </nav>
      )}
    </PageShell>
  );
}
