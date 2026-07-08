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
  stripHtml,
} from '@/lib/cms';
import { prepareDaozangArticle } from '@/lib/daozang-article';
import { compareArticles, resolveArticleCategory } from '@/lib/daozang-taxonomy';
import {
  chapterDisplayTitle,
  isBookCategory,
  localizedVolumeLabel,
  resolveVolume,
} from '@/lib/daozang-volumes';
import { DaozangBreadcrumb } from '../components';

import { Alert, AlertDescription, Badge, Card, CardContent, Separator } from '@orasage/ui';

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
  const volume = category && isBookCategory(category.key) ? resolveVolume(page) : null;
  const volumeLabel = volume ? localizedVolumeLabel(volume.key, t) : null;

  // 同分类（全书类同卷）上下篇（轻量索引，失败时静默降级）
  let prevArticle: { title: string; slug: string } | null = null;
  let nextArticle: { title: string; slug: string } | null = null;
  if (category) {
    try {
      const index = await fetchDaozangIndex(cmsLocale(locale));
      const siblings = index
        .filter((item) => resolveArticleCategory(item)?.key === category.key)
        .filter((item) => {
          if (!volume) return true;
          return resolveVolume(item)?.key === volume.key;
        })
        .sort(compareArticles);
      const position = siblings.findIndex((item) => item.slug === page.slug);
      if (position > 0) prevArticle = siblings[position - 1];
      if (position >= 0 && position < siblings.length - 1) nextArticle = siblings[position + 1];
    } catch {
      // 索引不可用时不展示上下篇
    }
  }

  const rawHtml = page.legacyHtml?.trim();
  const article = rawHtml ? prepareDaozangArticle(rawHtml, page.title) : null;
  const showToc = (article?.headings.length ?? 0) >= 2;
  const displayTitle =
    category?.titlePrefix && page.title
      ? chapterDisplayTitle(page.title, category.titlePrefix)
      : decodeHtmlEntities(page.title);

  return (
    <PageShell hideBack>
      <DaozangBreadcrumb
        items={[
          { label: t('title'), href: '/daozang' },
          ...(category && categoryLabel
            ? [{ label: categoryLabel, href: `/daozang?cat=${category.key}` }]
            : []),
          ...(category && volume && volumeLabel
            ? [
                {
                  label: volumeLabel,
                  href: `/daozang?cat=${category.key}&vol=${encodeURIComponent(volume.key)}`,
                },
              ]
            : []),
          { label: decodeHtmlEntities(page.title) },
        ]}
      />

      <header>
        <PageTitle>
          <ArticleTitle>{displayTitle}</ArticleTitle>
        </PageTitle>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {categoryLabel && category && (
            <Link href={`/daozang?cat=${category.key}`}>
              <Badge variant="muted">{categoryLabel}</Badge>
            </Link>
          )}
          {volumeLabel && category && (
            <Link href={`/daozang?cat=${category.key}&vol=${encodeURIComponent(volume!.key)}`}>
              <Badge variant="muted">{volumeLabel}</Badge>
            </Link>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t('annotationLegend')}</p>
      </header>

      <Separator className="my-6 sm:my-8" />

      {showToc && article && (
        <nav
          aria-label={t('toc')}
          className="sticky top-0 z-20 -mx-5 mb-5 border-b border-border/80 bg-background/95 px-5 backdrop-blur-sm sm:-mx-6 sm:px-6"
        >
          <div className="flex gap-1.5 overflow-x-auto py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {article.headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className="whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {heading.text}
              </a>
            ))}
          </div>
        </nav>
      )}

      {article ? (
        <article
          className="legacy-html-article daozang-article prose-sage break-words"
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
                    {decodeHtmlEntities(
                      category?.titlePrefix
                        ? chapterDisplayTitle(prevArticle.title, category.titlePrefix)
                        : prevArticle.title,
                    )}
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
                    {decodeHtmlEntities(
                      category?.titlePrefix
                        ? chapterDisplayTitle(nextArticle.title, category.titlePrefix)
                        : nextArticle.title,
                    )}
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
