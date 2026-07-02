import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle } from '@/components/PageShell';
import { cmsLocale, daozangArticlePath, decodeHtmlEntities, fetchCmsPages, stripHtml } from '@/lib/cms';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function DaozangPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('daozang');

  const page = Math.max(1, Number(pageParam) || 1);
  const cmsLoc = cmsLocale(locale);

  let articles: Awaited<ReturnType<typeof fetchCmsPages>> | null = null;
  try {
    articles = await fetchCmsPages({ section: 'daozang', locale: cmsLoc, page, limit: 30 });
  } catch {
    articles = null;
  }

  return (
    <PageShell>
      <PageTitle>{t('title')}</PageTitle>
      <p className="mt-3 text-[15px] leading-relaxed text-sage-muted sm:mt-4 sm:text-base">
        {t('desc')}
      </p>

      {!articles ? (
        <div className="mt-6 rounded-xl border border-dashed border-sage-border p-10 text-center text-sm text-sage-purple sm:mt-8">
          {t('loadError')}
        </div>
      ) : articles.docs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-sage-border p-10 text-center text-sm text-sage-purple sm:mt-8">
          {t('empty')}
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-sage-purple">
            {t('total', { count: articles.totalDocs })}
          </p>
          <ul className="mt-6 divide-y divide-sage-border border-y border-sage-border">
            {articles.docs.map((item) => (
              <li key={item.id} className="py-4 sm:py-5">
                <Link
                  href={daozangArticlePath(item.slug)}
                  className="group block"
                >
                  <h2 className="font-serif text-lg text-sage-gold transition group-hover:text-white sm:text-xl">
                    {decodeHtmlEntities(item.title)}
                  </h2>
                  {item.legacyHtml && (
                    <p className="mt-2 text-sm leading-relaxed text-sage-muted">
                      {stripHtml(item.legacyHtml)}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {(articles.hasPrevPage || articles.hasNextPage) && (
            <nav className="mt-8 flex items-center justify-between gap-4 text-sm">
              {articles.hasPrevPage ? (
                <Link
                  href={`/daozang?page=${page - 1}`}
                  className="text-sage-gold hover:text-white"
                >
                  ← {t('prev')}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sage-purple">
                {page} / {articles.totalPages}
              </span>
              {articles.hasNextPage ? (
                <Link
                  href={`/daozang?page=${page + 1}`}
                  className="text-sage-gold hover:text-white"
                >
                  {t('next')} →
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
