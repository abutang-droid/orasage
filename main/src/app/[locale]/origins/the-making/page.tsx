import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';
import { MAKING_META, MAKING_SKUS, isMakingLiveSku } from '@/lib/origins-making';

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
          'Five piece stories — materials, making, and choices you can verify. All five crystal SKUs are live.',
          '五款单品故事：材料、工艺与可核验的选择。五款水晶 SKU 均已上线。',
        )}
      </PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {MAKING_SKUS.map((sku) => {
          const m = MAKING_META[sku];
          const live = isMakingLiveSku(sku);
          const body = (
            <>
              <p className="text-xs tracking-wide text-muted-foreground">
                {isZh ? `${m.elementZh} · ${m.intentionZh}` : `${m.elementEn} · ${m.intentionEn}`}
              </p>
              <h2 className="mt-2 font-serif text-lg font-medium text-foreground">
                {isZh ? m.nameZh : m.nameEn}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {live ? t('Read the making →', '阅读造物记 →') : t('In progress', '撰写中')}
              </p>
            </>
          );
          return (
            <li key={sku}>
              {live ? (
                <Link
                  href={`/origins/the-making/${sku}`}
                  className="block rounded-[var(--os-radius-card,1rem)] border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                >
                  {body}
                </Link>
              ) : (
                <div
                  className="block rounded-[var(--os-radius-card,1rem)] border border-dashed border-border bg-card/60 p-5 opacity-80"
                  aria-disabled="true"
                >
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
