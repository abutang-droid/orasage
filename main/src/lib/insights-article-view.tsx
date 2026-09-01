import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import type { InsightsArticle } from '@/lib/insights-articles';
import { insightsArticlePath } from '@/lib/insights-articles';

type Props = {
  locale: string;
  article: InsightsArticle;
  pillarTitleEn: string;
  pillarTitleZh: string;
  pillarPath: string;
};

export function InsightsArticleView({
  locale,
  article,
  pillarTitleEn,
  pillarTitleZh,
  pillarPath,
}: Props) {
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  return (
    <PageShell className="max-w-3xl">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          {t('Home', '首页')}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/insights" className="hover:text-foreground">
          {t('Insights', '玄析')}
        </Link>
        <span className="mx-2">/</span>
        <Link href={pillarPath} className="hover:text-foreground">
          {isZh ? pillarTitleZh : pillarTitleEn}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{isZh ? article.titleZh : article.titleEn}</span>
      </nav>

      <PageTitle>{isZh ? article.titleZh : article.titleEn}</PageTitle>
      <PageLead>{isZh ? article.descriptionZh : article.descriptionEn}</PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <article className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {article.paragraphs.map((p, i) => (
            <p key={i}>{isZh ? p.zh : p.en}</p>
          ))}
        </div>
      </article>

      <p className="mt-10 text-sm">
        <Link href={pillarPath} className="text-foreground underline-offset-4 hover:underline">
          {t(`← Back to ${pillarTitleEn}`, `← 返回${pillarTitleZh}`)}
        </Link>
        {' · '}
        <Link href="/insights" className="text-foreground underline-offset-4 hover:underline">
          {t('Insights hub', '玄析首页')}
        </Link>
      </p>

      <Disclaimer variant="standard" locale={locale} className="mt-12" />
    </PageShell>
  );
}

export function InsightsArticleList({
  locale,
  articles,
}: {
  locale: string;
  articles: InsightsArticle[];
}) {
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  if (articles.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-medium text-foreground">{t('Articles', '文章')}</h2>
      <ul className="mt-4 space-y-3">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={insightsArticlePath(a.pillar, a.slug)}
              className="block rounded-[var(--os-radius-card)] border border-border bg-card p-4 transition-colors hover:border-foreground/20"
            >
              <span className="font-medium text-foreground">{isZh ? a.titleZh : a.titleEn}</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {isZh ? a.descriptionZh : a.descriptionEn}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
