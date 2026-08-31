import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';
import { externalUrls } from '@/lib/urls';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: '/readings',
    title: isZh ? '测算 | OraSage' : 'Readings | OraSage',
    description: isZh
      ? '八字、紫微、塔罗 — 一次生辰，三种结构对照。免费排盘，娱乐与自我探索用途。'
      : 'BaZi, Zi Wei, and Tarot — one birth time, three structural lenses. Free charts for entertainment and self-exploration.',
  });
}

const FAQ = [
  {
    q: { en: 'Are the charts free?', zh: '测算免费吗？' },
    a: {
      en: 'Yes. Chart generation is free. Optional digital reports may be offered separately.',
      zh: '是。排盘本身免费；可选数字报告另行提供。',
    },
  },
  {
    q: { en: 'Do I need an account?', zh: '需要注册吗？' },
    a: {
      en: 'You can try charts as a guest. Sign in to sync history across devices.',
      zh: '游客也可试用。登录后可跨设备同步记录。',
    },
  },
  {
    q: { en: 'How accurate are the results?', zh: '结果准吗？' },
    a: {
      en: 'These are cultural frameworks for reflection, not predictions or advice.',
      zh: '这是用于内省的文化框架，不是预测或建议。',
    },
  },
  {
    q: { en: 'How is my data used?', zh: '数据如何使用？' },
    a: {
      en: 'Birth data is used to compute charts. See Privacy for retention and rights.',
      zh: '生辰仅用于排盘计算。保留与权利见隐私政策。',
    },
  },
  {
    q: { en: 'How do readings relate to the shop?', zh: '测算与商城有什么关系？' },
    a: {
      en: 'Crystal pieces are mindful jewelry tied to Five Elements symbolism — not guarantees of outcomes.',
      zh: '水晶是承载五行意象的器物，不是结果承诺。',
    },
  },
];

export default async function ReadingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: isZh ? item.q.zh : item.q.en,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isZh ? item.a.zh : item.a.en,
      },
    })),
  };

  return (
    <PageShell hideBack className="max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          {t('Home', '首页')}
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-foreground">{t('Readings', '测算')}</span>
      </nav>

      <PageTitle>
        {t('Three Eastern systems. One input. Free, always.', '三种东方体系。一次输入。始终免费。')}
      </PageTitle>
      <PageLead>
        {t(
          'We use BaZi, Zi Wei, and Tarot as structured lenses for introspection — not fortune telling.',
          '八字、紫微与塔罗是内省的结构透镜，不是算命。',
        )}
      </PageLead>

      <Disclaimer variant="full" locale={locale} className="mt-6" />

      <section className="mt-10" aria-labelledby="charts-heading">
        <h2 id="charts-heading" className="font-serif text-xl font-medium text-foreground">
          {t('Charts', '排盘')}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <article className="rounded-[var(--os-radius-card)] border border-border bg-card p-5 shadow-surface-1 sm:col-span-1 ring-1 ring-foreground/10">
            <h3 className="text-lg font-medium">{t('BaZi 八字', '八字 BaZi')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('Five Elements structure from birth time.', '以生辰看五行结构。')}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('Output: Day Master + element balance.', '输出：日主与五行分布。')}
            </p>
            <a
              href={externalUrls.bazi}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[var(--os-radius-btn)] bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t('Get my chart', '开始排盘')}
            </a>
          </article>
          <article className="rounded-[var(--os-radius-card)] border border-border bg-card p-5 opacity-95">
            <h3 className="text-lg font-medium">{t('Zi Wei 紫微', '紫微 Zi Wei')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('Twelve palaces as a life map.', '十二宫位的人生地图。')}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('Explore at your pace — no primary CTA yet.', '按自己的节奏探索。')}
            </p>
            <a href={externalUrls.ziwei} className="mt-4 inline-flex text-sm text-foreground underline-offset-4 hover:underline">
              {t('Open Zi Wei →', '进入紫微 →')}
            </a>
          </article>
          <article className="rounded-[var(--os-radius-card)] border border-border bg-card p-5 opacity-95">
            <h3 className="text-lg font-medium">{t('Tarot 塔罗', '塔罗 Tarot')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('Symbolic draws for reflection.', '以牌面象征陪你反思。')}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('Explore at your pace — no primary CTA yet.', '按自己的节奏探索。')}
            </p>
            <a href={externalUrls.tarot} className="mt-4 inline-flex text-sm text-foreground underline-offset-4 hover:underline">
              {t('Open Tarot →', '进入塔罗 →')}
            </a>
          </article>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="blessings-heading">
        <h2 id="blessings-heading" className="font-serif text-xl font-medium text-foreground">
          {t('Blessings', '祈愿')}
        </h2>
        <article className="mt-4 rounded-[var(--os-radius-card)] border border-border bg-card p-5">
          <h3 className="text-lg font-medium">{t('Wishing Well 祈愿池', '祈愿池 Wishing Well')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('Support the project', '支持本项目')}</p>
          <a
            href={externalUrls.temple}
            className="mt-4 inline-flex text-sm text-foreground underline-offset-4 hover:underline"
          >
            {t('Visit the Wishing Well →', '前往祈愿池 →')}
          </a>
        </article>
      </section>

      <section className="mt-10" aria-labelledby="canon-heading">
        <h2 id="canon-heading" className="font-serif text-xl font-medium text-foreground">
          {t('Canon', '典籍')}
        </h2>
        <article className="mt-4 rounded-[var(--os-radius-card)] border border-border bg-card p-5">
          <h3 className="text-lg font-medium">{t('Dao Canon 道藏', '道藏 Dao Canon')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('The Five Arts knowledge library', '山医命相卜 · 五术知识库')}
          </p>
          <Link href="/daozang" className="mt-4 inline-flex text-sm text-foreground underline-offset-4 hover:underline">
            {t('Browse Dao Canon →', '浏览道藏 →')}
          </Link>
        </article>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium text-foreground">
          {t('One birth time, three lenses', '一次生辰，三种透镜')}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t(
            'Enter a birth time once and compare BaZi, Zi Wei, and Tarot as mutual references — we do not claim cross-system prediction.',
            '一次输入生辰，对照八字、紫微与塔罗作为互参——我们不宣称交叉预测。',
          )}
        </p>
      </section>

      <section className="mt-10" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-serif text-xl font-medium text-foreground">
          FAQ
        </h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q.en}>
              <dt className="font-medium text-foreground">{isZh ? item.q.zh : item.q.en}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{isZh ? item.a.zh : item.a.en}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <p className="text-sm text-muted-foreground">
          {t('New here? Start with Insights →', '新来的？从玄析开始 →')}
        </p>
        <Link href="/insights" className="mt-2 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline">
          {t('Browse Insights', '浏览玄析')}
        </Link>
      </section>
    </PageShell>
  );
}
