import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';
import { getArticlesByPillar, getPillarIntro } from '@/lib/insights-articles';
import { InsightsArticleList } from '@/lib/insights-article-view';

type Pillar = 'day-master' | 'five-elements' | 'solar-terms' | 'crystal';

const PILLARS: Record<
  Pillar,
  { path: string; titleEn: string; titleZh: string; leadEn: string; leadZh: string }
> = {
  'day-master': {
    path: '/insights/day-master',
    titleEn: 'Day Master Typology',
    titleZh: '日主人格学',
    leadEn: 'Twelve Day Masters as reflective archetypes — structure, not fortune.',
    leadZh: '十二日主作为内省原型——讲结构，不问吉凶。',
  },
  'five-elements': {
    path: '/insights/five-elements',
    titleEn: 'Five Elements Decoded',
    titleZh: '五行解码',
    leadEn: 'Wood, Fire, Earth, Metal, Water as symbolic structure.',
    leadZh: '木火土金水作为象征结构。',
  },
  'solar-terms': {
    path: '/insights/solar-terms',
    titleEn: '24 Solar Terms',
    titleZh: '节气与流年',
    leadEn: 'Seasonal markers without fortune forecasts.',
    leadZh: '节气节点，不做运势预测。',
  },
  crystal: {
    path: '/insights/crystal',
    titleEn: 'Crystal Companion',
    titleZh: '水晶志',
    leadEn: 'Jewelry as intention reminders — not outcome guarantees.',
    leadZh: '器物承载意图，不是结果保证。',
  },
};

export function buildPillarPage(pillar: Pillar) {
  async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    const meta = PILLARS[pillar];
    const isZh = locale.startsWith('zh');
    return buildPortalPageMeta({
      locale,
      pathname: meta.path,
      title: `${isZh ? meta.titleZh : meta.titleEn} | OraSage`,
      description: isZh ? meta.leadZh : meta.leadEn,
    });
  }

  async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const isZh = locale.startsWith('zh');
    const t = (en: string, zh: string) => (isZh ? zh : en);
    const meta = PILLARS[pillar];
    const intro = getPillarIntro(pillar);
    const articles = getArticlesByPillar(pillar);

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
          <span className="text-foreground">{isZh ? meta.titleZh : meta.titleEn}</span>
        </nav>

        <PageTitle>{isZh ? meta.titleZh : meta.titleEn}</PageTitle>
        <PageLead>{isZh ? meta.leadZh : meta.leadEn}</PageLead>

        <Disclaimer variant="compact" locale={locale} className="mt-6" />

        {intro ? (
          <div className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {intro.paragraphs.map((p, i) => (
              <p key={i}>{isZh ? p.zh : p.en}</p>
            ))}
          </div>
        ) : null}

        <InsightsArticleList locale={locale} articles={articles} />

        <p className="mt-10 text-sm">
          <Link href="/insights" className="text-foreground underline-offset-4 hover:underline">
            {t('← Back to Insights', '← 返回玄析')}
          </Link>
        </p>

        <Disclaimer variant="standard" locale={locale} className="mt-12" />
      </PageShell>
    );
  }

  return { generateMetadata, Page };
}
