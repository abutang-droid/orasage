import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: '/insights',
    title: isZh ? '玄析 | OraSage' : 'Insights | OraSage',
    description: isZh
      ? '理解结构，不问吉凶。日主、五行、节气与水晶志。'
      : 'Understand the structure. Not the fortune. Day Master, Five Elements, solar terms, and crystal companions.',
  });
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  const pillars = [
    {
      href: '/insights/day-master',
      title: t('Day Master Typology', '日主人格学'),
      desc: t('Start here — twelve Day Masters as reflective archetypes.', '从这里开始：十二日主作为内省原型。'),
      featured: true,
    },
    {
      href: '/insights/five-elements',
      title: t('Five Elements Decoded', '五行解码'),
      desc: t('Wood, Fire, Earth, Metal, Water as symbolic structure.', '木火土金水作为象征结构。'),
    },
    {
      href: '/insights/solar-terms',
      title: t('24 Solar Terms', '节气与流年'),
      desc: t('Seasonal markers without fortune forecasts.', '节气节点，不做运势预测。'),
    },
    {
      href: '/insights/crystal',
      title: t('Crystal Companion', '水晶志'),
      desc: t('Jewelry as intention reminders — not guarantees.', '器物承载意图，不是结果保证。'),
    },
  ];

  return (
    <PageShell hideBack className="max-w-4xl">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          {t('Home', '首页')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t('Insights', '玄析')}</span>
      </nav>

      <PageTitle>{t('Understand the structure. Not the fortune.', '理解结构，不问吉凶。')}</PageTitle>
      <PageLead>
        {t(
          'Essays and explainers on Eastern frameworks for introspection. Content is rolling out.',
          '东方内省框架的解说与短文。内容持续上线中。',
        )}
      </PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <section id="pillars" className="mt-10 grid gap-4 sm:grid-cols-2">
        {pillars.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={`rounded-[var(--os-radius-card)] border border-border bg-card p-5 transition-colors hover:border-foreground/20 ${
              p.featured ? 'sm:col-span-2 ring-1 ring-foreground/10' : ''
            }`}
          >
            <h2 className="font-serif text-lg font-medium text-foreground">{p.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
          </Link>
        ))}
      </section>

      <section id="latest" className="mt-12">
        <h2 className="font-serif text-xl font-medium">{t('Latest', '最新')}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('Featured essays will appear here (Batch 3+ content).', '精选文章将在此呈现（后续批次上线）。')}
        </p>
      </section>

      <section id="corrections" className="mt-10">
        <h2 className="font-serif text-xl font-medium">{t('Corrections', '勘误')}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('We publish corrections when we find errors in published pieces.', '发现已刊文错误时，我们会公开勘误。')}
        </p>
      </section>

      <Disclaimer variant="standard" locale={locale} className="mt-12" />
    </PageShell>
  );
}
