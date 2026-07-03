import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle } from '@/components/PageShell';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cmsLocale, decodeHtmlEntities, famousArticlePath, fetchCmsPages, stripHtml } from '@/lib/cms';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function FamousPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('famous');

  const page = Math.max(1, Number(pageParam) || 1);
  const cmsLoc = cmsLocale(locale);

  let articles: Awaited<ReturnType<typeof fetchCmsPages>> | null = null;
  try {
    articles = await fetchCmsPages({ section: 'famous', locale: cmsLoc, page, limit: 30 });
  } catch {
    articles = null;
  }

  return (
    <PageShell className="max-w-5xl">
      <header className="max-w-3xl">
        <PageTitle>{t('title')}</PageTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
          {t('desc')}
        </p>
      </header>

      {!articles ? (
        <Alert variant="destructive" className="mt-6 sm:mt-8">
          <AlertDescription>{t('loadError')}</AlertDescription>
        </Alert>
      ) : articles.docs.length === 0 ? (
        <Alert className="mt-6 border-dashed sm:mt-8">
          <AlertDescription>{t('empty')}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Badge variant="muted" className="mt-5">
            {t('total', { count: articles.totalDocs })}
          </Badge>

          <ul className="mt-6 grid gap-3 sm:gap-4">
            {articles.docs.map((item) => (
              <li key={item.id}>
                <Card variant="interactive" asChild>
                  <Link href={famousArticlePath(item.slug)} className="group block">
                    <CardContent className="p-5 sm:p-6">
                      <h2 className="font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl">
                        {decodeHtmlEntities(item.title)}
                      </h2>
                      {item.legacyHtml && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {stripHtml(item.legacyHtml)}
                        </p>
                      )}
                    </CardContent>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>

          {(articles.hasPrevPage || articles.hasNextPage) && (
            <nav className="mt-8 flex items-center justify-between gap-4 text-sm" aria-label="Pagination">
              {articles.hasPrevPage ? (
                <Link href={`/famous?page=${page - 1}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  {t('prev')}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted-foreground" aria-current="page">
                {page} / {articles.totalPages}
              </span>
              {articles.hasNextPage ? (
                <Link href={`/famous?page=${page + 1}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  {t('next')}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}
    </PageShell>
  );
}
