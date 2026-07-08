import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { cmsLocale, decodeHtmlEntities, fetchDaozangIndex, type DaozangIndexItem } from '@/lib/cms';
import {
  DAOZANG_TOPS,
  categoriesOfTop,
  compareArticles,
  getDaozangCategory,
  groupArticlesByCategory,
  isDaozangCategoryKey,
  resolveArticleCategory,
} from '@/lib/daozang-taxonomy';
import {
  chapterDisplayTitle,
  isBookCategory,
  localizedVolumeLabel,
  resolveVolume,
  sortedVolumeGroups,
} from '@/lib/daozang-volumes';
import { DaozangArticleCard, DaozangBreadcrumb, DaozangSearchForm } from './components';

import { Alert, AlertDescription, Badge, Card, CardContent, buttonVariants } from '@orasage/ui';

const PAGE_SIZE = 30;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; cat?: string; q?: string; vol?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { cat, vol } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'daozang' });
  if (isDaozangCategoryKey(cat)) {
    const categoryTitle = t(`categories.${cat}`);
    if (vol && isBookCategory(cat)) {
      return {
        title: `${localizedVolumeLabel(vol, t)} · ${categoryTitle} · ${t('title')}`,
        description: t('desc'),
      };
    }
    return { title: `${categoryTitle} · ${t('title')}`, description: t('desc') };
  }
  return { title: t('title'), description: t('desc') };
}

export default async function DaozangPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageParam, cat, q, vol } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('daozang');

  let index: DaozangIndexItem[] | null = null;
  try {
    index = await fetchDaozangIndex(cmsLocale(locale));
  } catch {
    index = null;
  }

  if (!index) {
    return (
      <DaozangShell t={t} locale={locale} query={q}>
        <Alert variant="destructive" className="mt-6 sm:mt-8">
          <AlertDescription>{t('loadError')}</AlertDescription>
        </Alert>
      </DaozangShell>
    );
  }

  const query = q?.trim();
  if (query) {
    return <SearchResults t={t} locale={locale} index={index} query={query} />;
  }

  if (isDaozangCategoryKey(cat)) {
    const page = Math.max(1, Number(pageParam) || 1);
    if (isBookCategory(cat)) {
      if (vol) {
        return (
          <VolumeChapterList
            t={t}
            locale={locale}
            index={index}
            categoryKey={cat}
            volumeKey={vol}
            page={page}
          />
        );
      }
      return <BookVolumeOverview t={t} locale={locale} index={index} categoryKey={cat} />;
    }
    return <CategoryList t={t} locale={locale} index={index} categoryKey={cat} page={page} />;
  }

  return <CategoryOverview t={t} locale={locale} index={index} />;
}

type Translator = Awaited<ReturnType<typeof getTranslations>>;

function DaozangShell({
  t,
  locale,
  query,
  breadcrumb,
  children,
}: {
  t: Translator;
  locale: string;
  query?: string;
  breadcrumb?: { label: string; href?: string }[];
  children: React.ReactNode;
}) {
  return (
    <PageShell className="max-w-5xl">
      {breadcrumb && <DaozangBreadcrumb items={breadcrumb} />}
      <header className="max-w-3xl">
        <PageTitle>{t('title')}</PageTitle>
        <PageLead>{t('desc')}</PageLead>
      </header>
      <div className="mt-5 sm:mt-6">
        <DaozangSearchForm locale={locale} placeholder={t('searchPlaceholder')} defaultValue={query} />
      </div>
      {children}
    </PageShell>
  );
}

function categoryBreadcrumbLabel(t: Translator, category: ReturnType<typeof getDaozangCategory>) {
  return `${t(`tops.${category.top}.name`)} · ${t(`categories.${category.key}`)}`;
}

/** 分类总览：山医命相卜 五术分组 */
function CategoryOverview({
  t,
  locale,
  index,
}: {
  t: Translator;
  locale: string;
  index: DaozangIndexItem[];
}) {
  const { byCategory, uncategorized } = groupArticlesByCategory(index);

  if (index.length === 0) {
    return (
      <DaozangShell t={t} locale={locale}>
        <Alert className="mt-6 border-dashed sm:mt-8">
          <AlertDescription>{t('empty')}</AlertDescription>
        </Alert>
      </DaozangShell>
    );
  }

  return (
    <DaozangShell t={t} locale={locale}>
      <Badge variant="muted" className="mt-5">
        {t('total', { count: index.length })}
      </Badge>

      {DAOZANG_TOPS.map((top) => {
        const sections = categoriesOfTop(top)
          .map((category) => ({ category, items: byCategory.get(category.key) ?? [] }))
          .filter(({ items }) => items.length > 0);
        if (sections.length === 0) return null;

        return (
          <section key={top} className="mt-8 sm:mt-10" aria-labelledby={`daozang-top-${top}`}>
            <div className="flex items-baseline gap-3">
              <h2
                id={`daozang-top-${top}`}
                className="font-serif text-heading-2 font-semibold text-foreground"
              >
                {t(`tops.${top}.name`)}
              </h2>
              <p className="text-sm text-muted-foreground">{t(`tops.${top}.desc`)}</p>
            </div>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
              {sections.map(({ category, items }) => (
                <li key={category.key}>
                  <Card variant="interactive" asChild>
                    <Link href={`/daozang?cat=${category.key}`} className="group block h-full">
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-heading-3 font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
                            {t(`categories.${category.key}`)}
                          </h3>
                          <Badge variant="muted" className="shrink-0">
                            {t('articleCount', { count: items.length })}
                          </Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {items
                            .slice(0, 3)
                            .map((item) => decodeHtmlEntities(item.title))
                            .join(' · ')}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {uncategorized.length > 0 && (
        <section className="mt-8 sm:mt-10" aria-labelledby="daozang-top-other">
          <h2 id="daozang-top-other" className="font-serif text-heading-2 font-semibold text-foreground">
            {t('uncategorized')}
          </h2>
          <ul className="mt-4 grid gap-3 sm:gap-4">
            {uncategorized.map((item) => (
              <li key={item.id}>
                <DaozangArticleCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </DaozangShell>
  );
}

/** 四部全书：按卷二级目录 */
function BookVolumeOverview({
  t,
  locale,
  index,
  categoryKey,
}: {
  t: Translator;
  locale: string;
  index: DaozangIndexItem[];
  categoryKey: Parameters<typeof getDaozangCategory>[0];
}) {
  const category = getDaozangCategory(categoryKey);
  const { byCategory } = groupArticlesByCategory(index);
  const items = byCategory.get(category.key) ?? [];
  const volumeGroups = sortedVolumeGroups(items);
  const categoryLabel = categoryBreadcrumbLabel(t, category);

  return (
    <PageShell className="max-w-5xl" hideBack>
      <DaozangBreadcrumb
        items={[
          { label: t('title'), href: '/daozang' },
          { label: categoryLabel },
        ]}
      />
      <header className="max-w-3xl">
        <PageTitle>{t(`categories.${category.key}`)}</PageTitle>
        <PageLead>{t(`tops.${category.top}.desc`)}</PageLead>
      </header>

      <div className="mt-5 sm:mt-6">
        <DaozangSearchForm locale={locale} placeholder={t('searchPlaceholder')} />
      </div>

      {items.length === 0 ? (
        <Alert className="mt-6 border-dashed sm:mt-8">
          <AlertDescription>{t('empty')}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Badge variant="muted" className="mt-5">
            {t('total', { count: items.length })}
          </Badge>

          <section className="mt-6 sm:mt-8" aria-labelledby="daozang-volume-browse">
            <h2 id="daozang-volume-browse" className="font-serif text-heading-3 font-semibold text-foreground">
              {t('volumeBrowse')}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {volumeGroups.map(({ volume, items: volItems }) => (
                <li key={volume.key}>
                  <Card variant="interactive" asChild>
                    <Link
                      href={`/daozang?cat=${category.key}&vol=${encodeURIComponent(volume.key)}`}
                      className="group block h-full"
                    >
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-heading-3 font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
                            {localizedVolumeLabel(volume.key, t)}
                          </h3>
                          <Badge variant="muted" className="shrink-0">
                            {t('articleCount', { count: volItems.length })}
                          </Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {volItems
                            .slice(0, 3)
                            .map((item) =>
                              decodeHtmlEntities(
                                chapterDisplayTitle(item.title, category.titlePrefix),
                              ),
                            )
                            .join(' · ')}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </PageShell>
  );
}

/** 四部全书：某卷章节列表 */
function VolumeChapterList({
  t,
  locale,
  index,
  categoryKey,
  volumeKey,
  page,
}: {
  t: Translator;
  locale: string;
  index: DaozangIndexItem[];
  categoryKey: Parameters<typeof getDaozangCategory>[0];
  volumeKey: string;
  page: number;
}) {
  const category = getDaozangCategory(categoryKey);
  const { byCategory } = groupArticlesByCategory(index);
  const allItems = byCategory.get(category.key) ?? [];
  const items = allItems.filter((item) => resolveVolume(item)?.key === volumeKey);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const categoryLabel = categoryBreadcrumbLabel(t, category);
  const volumeLabel = localizedVolumeLabel(volumeKey, t);

  return (
    <PageShell className="max-w-5xl" hideBack>
      <DaozangBreadcrumb
        items={[
          { label: t('title'), href: '/daozang' },
          { label: categoryLabel, href: `/daozang?cat=${category.key}` },
          { label: volumeLabel },
        ]}
      />
      <header className="max-w-3xl">
        <PageTitle>{volumeLabel}</PageTitle>
        <PageLead>{t(`categories.${category.key}`)}</PageLead>
      </header>

      <div className="mt-5 sm:mt-6">
        <DaozangSearchForm locale={locale} placeholder={t('searchPlaceholder')} />
      </div>

      {items.length === 0 ? (
        <Alert className="mt-6 border-dashed sm:mt-8">
          <AlertDescription>{t('empty')}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Badge variant="muted" className="mt-5">
            {t('total', { count: items.length })}
          </Badge>

          <ul className="mt-6 grid gap-3 sm:gap-4">
            {pageItems.map((item) => (
              <li key={item.id}>
                <DaozangArticleCard
                  item={item}
                  displayTitle={chapterDisplayTitle(item.title, category.titlePrefix)}
                />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between gap-4 text-sm" aria-label="Pagination">
              {currentPage > 1 ? (
                <Link
                  href={`/daozang?cat=${category.key}&vol=${encodeURIComponent(volumeKey)}&page=${currentPage - 1}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  {t('prev')}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted-foreground" aria-current="page">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={`/daozang?cat=${category.key}&vol=${encodeURIComponent(volumeKey)}&page=${currentPage + 1}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
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

/** 分类文章列表（带分页与面包屑） */
function CategoryList({
  t,
  locale,
  index,
  categoryKey,
  page,
}: {
  t: Translator;
  locale: string;
  index: DaozangIndexItem[];
  categoryKey: Parameters<typeof getDaozangCategory>[0];
  page: number;
}) {
  const category = getDaozangCategory(categoryKey);
  const { byCategory } = groupArticlesByCategory(index);
  const items = byCategory.get(category.key) ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const categoryLabel = categoryBreadcrumbLabel(t, category);

  return (
    <PageShell className="max-w-5xl" hideBack>
      <DaozangBreadcrumb
        items={[
          { label: t('title'), href: '/daozang' },
          { label: categoryLabel },
        ]}
      />
      <header className="max-w-3xl">
        <PageTitle>{t(`categories.${category.key}`)}</PageTitle>
        <PageLead>{t(`tops.${category.top}.desc`)}</PageLead>
      </header>

      <div className="mt-5 sm:mt-6">
        <DaozangSearchForm locale={locale} placeholder={t('searchPlaceholder')} />
      </div>

      {items.length === 0 ? (
        <Alert className="mt-6 border-dashed sm:mt-8">
          <AlertDescription>{t('empty')}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Badge variant="muted" className="mt-5">
            {t('total', { count: items.length })}
          </Badge>

          <ul className="mt-6 grid gap-3 sm:gap-4">
            {pageItems.map((item) => (
              <li key={item.id}>
                <DaozangArticleCard item={item} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between gap-4 text-sm" aria-label="Pagination">
              {currentPage > 1 ? (
                <Link
                  href={`/daozang?cat=${category.key}&page=${currentPage - 1}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  {t('prev')}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted-foreground" aria-current="page">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={`/daozang?cat=${category.key}&page=${currentPage + 1}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
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

/** 标题 + 摘要的站内搜索结果 */
function SearchResults({
  t,
  locale,
  index,
  query,
}: {
  t: Translator;
  locale: string;
  index: DaozangIndexItem[];
  query: string;
}) {
  const needle = query.toLowerCase();
  const results = index
    .filter((item) => {
      const title = decodeHtmlEntities(item.title).toLowerCase();
      const excerpt = (item.excerpt ?? '').toLowerCase();
      return title.includes(needle) || excerpt.includes(needle);
    })
    .sort(compareArticles);

  return (
    <PageShell className="max-w-5xl" hideBack>
      <DaozangBreadcrumb items={[{ label: t('title'), href: '/daozang' }, { label: t('searchCrumb') }]} />
      <header className="max-w-3xl">
        <PageTitle>{t('title')}</PageTitle>
        <PageLead>{t('desc')}</PageLead>
      </header>

      <div className="mt-5 sm:mt-6">
        <DaozangSearchForm locale={locale} placeholder={t('searchPlaceholder')} defaultValue={query} />
      </div>

      {results.length === 0 ? (
        <Alert className="mt-6 border-dashed sm:mt-8">
          <AlertDescription>{t('searchEmpty', { query })}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Badge variant="muted" className="mt-5">
            {t('searchResults', { query, count: results.length })}
          </Badge>
          <ul className="mt-6 grid gap-3 sm:gap-4">
            {results.map((item) => {
              const category = resolveArticleCategory(item);
              const label = category
                ? `${t(`tops.${category.top}.name`)} · ${t(`categories.${category.key}`)}`
                : undefined;
              const bookPrefix = category?.titlePrefix;
              return (
                <li key={item.id}>
                  <DaozangArticleCard
                    item={item}
                    categoryLabel={label}
                    displayTitle={
                      bookPrefix ? chapterDisplayTitle(item.title, bookPrefix) : undefined
                    }
                  />
                </li>
              );
            })}
          </ul>
          <div className="mt-6">
            <Link href="/daozang" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              {t('clearSearch')}
            </Link>
          </div>
        </>
      )}
    </PageShell>
  );
}
