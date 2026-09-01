import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

const SECTIONS: { titleEn: string; titleZh: string; paragraphs: { en: string; zh: string }[] }[] =
  [
    {
      titleEn: 'Why content and craft together',
      titleZh: '为什么内容与工艺放在一起',
      paragraphs: [
        {
          en: 'OraSage pairs readable essays (Insights) with inspectable objects (Shop / The Making). The essays explain structure — Day Master, Five Elements, solar terms — as vocabulary for reflection. The objects carry intention frames you assign yourself. Neither side sells fortune or guaranteed outcomes.',
          zh: 'OraSage 把可读短文（玄析）与可检视器物（商城 / 造物记）放在一起。短文讲结构——日主、五行、节气——作为内省词汇。器物承载你自己指定的意图框架。两边都不卖运势或结果保证。',
        },
      ],
    },
    {
      titleEn: '“Know the structure. Do not ask fortune.”',
      titleZh: '「知结构，不问吉凶」',
      paragraphs: [
        {
          en: 'Eastern frameworks are rich maps. Used carelessly, they become prediction theaters. Our editorial rule is structural: describe patterns, invite prompts, refuse outcome language. Entertainment and culture first; never medical or financial advice.',
          zh: '东方框架是丰富的地图。用得轻率，就变成预测剧场。我们的编辑规则是结构性的：描述模式、邀请提示、拒绝结果语言。娱乐与文化优先；绝非医疗或财务建议。',
        },
      ],
    },
    {
      titleEn: 'What $168 is paying for',
      titleZh: '$168 在买什么',
      paragraphs: [
        {
          en: 'Each crystal bracelet lists material, bead size, wrist fit, and finish you can verify. The Making pages document selection and knotting. You are not paying for ritual dedication or claimed effects — you are paying for a finished piece plus a clear story of how it was made.',
          zh: '每款水晶手串列明可核验的材质、珠径、腕围与处理方式。造物记记录选石与打结。你付的不是仪式用语或宣称功效——而是一件成品，外加它如何被做成的清楚故事。',
        },
      ],
    },
    {
      titleEn: 'Where to go next',
      titleZh: '接下来去哪',
      paragraphs: [
        {
          en: 'Browse Insights for typology essays. Open The Making for per-SKU craft notes. Visit Atelier for the shared workshop steps. Shop holds price, stock, and returns.',
          zh: '玄析看类型短文；造物记看各 SKU 工艺笔记；工坊看共用制作步骤。价格、库存与退换在商城。',
        },
      ],
    },
  ];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: '/origins/our-story',
    title: isZh ? '缘起 | OraSage' : 'Our Story | OraSage',
    description: isZh
      ? 'OraSage 为何以内容电商讲述五行与器物 — 知结构，不问吉凶。'
      : 'Why OraSage builds content commerce around Five Elements and craft — structure, not fortune.',
  });
}

export default async function OurStoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  return (
    <PageShell hideBack className="max-w-3xl">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/origins" className="hover:text-foreground">
          {t('Origins', '造物')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t('Our Story', '缘起')}</span>
      </nav>

      <PageTitle>{t('Our Story', '缘起')}</PageTitle>
      <PageLead>
        {t(
          'Content commerce with inspectable craft — know the structure, do not ask fortune.',
          '可检视工艺的内容电商 — 知结构，不问吉凶。',
        )}
      </PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <div className="mt-10 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.titleEn} className="space-y-3">
            <h2 className="font-serif text-lg font-medium text-foreground">
              {isZh ? section.titleZh : section.titleEn}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {isZh ? p.zh : p.en}
              </p>
            ))}
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm">
        <Link href="/insights" className="text-foreground underline-offset-4 hover:underline">
          {t('Insights →', '玄析 →')}
        </Link>
        {' · '}
        <Link
          href="/origins/the-making"
          className="text-foreground underline-offset-4 hover:underline"
        >
          {t('The Making →', '造物记 →')}
        </Link>
        {' · '}
        <Link href="/origins/atelier" className="text-foreground underline-offset-4 hover:underline">
          {t('Atelier →', '工坊 →')}
        </Link>
      </p>

      <Disclaimer variant="product" locale={locale} className="mt-12" />
    </PageShell>
  );
}
