import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { FamousCategoryTabs, type FamousCategoryFilter } from '@/components/famous/FamousCategoryTabs';
import { FamousPersonCard } from '@/components/famous/FamousPersonCard';
import { cmsLocale, fetchFamousPages, type FamousDoc } from '@/lib/cms';
import { FAMOUS_CATEGORIES, type FamousCategory } from '@/lib/famous-index';
import { buildFamousListItems } from '@/lib/famous-list';

import { Alert, AlertDescription, Badge, buttonVariants } from '@orasage/ui';

const PAGE_SIZE = 30;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; cat?: string }>;
};

export default async function FamousPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageParam, cat: catParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('famous');

  const activeCat: FamousCategoryFilter = (FAMOUS_CATEGORIES as readonly string[]).includes(
    catParam ?? '',
  )
    ? (catParam as FamousCategory)
    : 'all';

  let docs: FamousDoc[] | null = null;
  try {
    docs = await fetchFamousPages(cmsLocale(locale));
  } catch {
    docs = null;
  }

  const items = docs ? buildFamousListItems(docs) : [];
  const filtered = activeCat === 'all' ? items : items.filter((item) => item.category === activeCat);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* 全部为回退语言（如 fr/de 界面）时显示中文提示；混合列表（如 en）时给回退内容打「中文」标 */
  const allFallback = items.length > 0 && items.every((item) => item.fallback);
  const fallbackTag = allFallback ? null : t('zhTag');

  const catLabels = Object.fromEntries(
    (['all', ...FAMOUS_CATEGORIES] as FamousCategoryFilter[]).map((cat) => [
      cat,
      t(`categories.${cat}`),
    ]),
  ) as Record<FamousCategoryFilter, string>;

  const pageHref = (p: number) =>
    activeCat === 'all' ? `/famous?page=${p}` : `/famous?cat=${activeCat}&page=${p}`;

  return (
    <PageShell className="max-w-5xl">
      <header className="max-w-3xl">
        <PageTitle>{t('title')}</PageTitle>
        <PageLead>{t('desc')}</PageLead>
        {allFallback && <p className="mt-2 text-xs text-muted-foreground">{t('zhNotice')}</p>}
      </header>

      {!docs ? (
        <Alert variant="destructive" className="mt-6 sm:mt-8">
          <AlertDescription>{t('loadError')}</AlertDescription>
        </Alert>
      ) : items.length === 0 ? (
        <Alert className="mt-6 border-dashed sm:mt-8">
          <AlertDescription>{t('empty')}</AlertDescription>
        </Alert>
      ) : (
        <>
          <FamousCategoryTabs active={activeCat} labels={catLabels} ariaLabel={t('categoriesAria')} />

          <Badge variant="muted" className="mt-5">
            {t('total', { count: filtered.length })}
          </Badge>

          {pageItems.length === 0 ? (
            <Alert className="mt-6 border-dashed">
              <AlertDescription>{t('empty')}</AlertDescription>
            </Alert>
          ) : (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
              {pageItems.map((item) => (
                <li key={item.slug} className="min-w-0">
                  <FamousPersonCard item={item} readLabel={t('read')} fallbackTag={fallbackTag} />
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between gap-4 text-sm" aria-label="Pagination">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  {t('prev')}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted-foreground" aria-current="page">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
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
