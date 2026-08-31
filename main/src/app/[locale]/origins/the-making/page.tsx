import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';
import { MAKING_META, MAKING_SKUS } from '@/lib/origins-making';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: '/origins/the-making',
    title: isZh ? '造物记 | OraSage' : 'The Making | OraSage',
    description: isZh
      ? '五款五行手串的设计决策与可核验工艺。'
      : 'Design decisions and inspectable craft for five Five Elements bracelets.',
  });
}

export default async function TheMakingIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  return (
    <PageShell hideBack className="max-w-4xl">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          {t('Home', '首页')}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/origins" className="hover:text-foreground">
          {t('Origins', '造物')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t('The Making', '造物记')}</span>
      </nav>

      <PageTitle>{t('The Making', '造物记')}</PageTitle>
      <PageLead>
        {t(
          'Five piece stories — materials, making, and choices you can verify. Full seven-screen narratives expand in later content batches.',
          '五款单品故事：材料、工艺与可核验的选择。完整七屏叙事将在后续内容批次展开。',
        )}
      </PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {MAKING_SKUS.map((sku) => {
          const m = MAKING_META[sku];
          return (
            <li key={sku}>
              <Link
                href={`/origins/the-making/${sku}`}
                className="block rounded-[var(--os-radius-card)] border border-border bg-card p-5 transition-colors hover:border-foreground/20"
              >
                <p className="text-xs tracking-wide text-muted-foreground">
                  {isZh ? `${m.elementZh} · ${m.intentionZh}` : `${m.elementEn} · ${m.intentionEn}`}
                </p>
                <h2 className="mt-2 font-serif text-lg font-medium text-foreground">
                  {isZh ? m.nameZh : m.nameEn}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{t('Read the making →', '阅读造物记 →')}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
