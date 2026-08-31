import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: `/reports/${id}`,
    title: isZh ? `数字报告 · ${id} | OraSage` : `Digital report · ${id} | OraSage`,
    description: isZh
      ? '站内 HTML 数字报告骨架（$0.99）。娱乐与自我探索用途。'
      : 'In-site HTML digital report skeleton ($0.99). Entertainment and self-exploration only.',
    noindex: true,
  });
}

/** Batch 3: $0.99 in-site HTML report skeleton (Q1). Wired to live jobs later. */
export default async function DigitalReportSkeletonPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  return (
    <PageShell className="max-w-3xl">
      <p className="text-xs tracking-wide text-muted-foreground">
        {t('Digital report · $0.99', '数字报告 · $0.99')} · ID {id}
      </p>
      <PageTitle>{t('Your structural reading', '你的结构解读')}</PageTitle>
      <PageLead>
        {t(
          'This is an in-site HTML report shell. Paid generation will render Day Master, element balance, and reflective notes here — not predictions.',
          '这是站内 HTML 报告骨架。付费生成后将在此呈现日主、五行分布与内省笔记——不是预测。',
        )}
      </PageLead>

      <Disclaimer variant="transaction" locale={locale} className="mt-6" />

      <article className="mt-10 space-y-8">
        <section className="rounded-[var(--os-radius-card)] border border-dashed border-border p-5">
          <h2 className="font-serif text-lg font-medium">{t('Chart summary', '命盘摘要')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('Placeholder — Day Master / pillars will appear after purchase unlock.', '占位 — 购买解锁后显示日主与四柱。')}
          </p>
        </section>
        <section className="rounded-[var(--os-radius-card)] border border-dashed border-border p-5">
          <h2 className="font-serif text-lg font-medium">{t('Five Elements balance', '五行分布')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('Placeholder — symbolic distribution chart.', '占位 — 象征性五行分布图。')}
          </p>
        </section>
        <section className="rounded-[var(--os-radius-card)] border border-dashed border-border p-5">
          <h2 className="font-serif text-lg font-medium">{t('Reflective notes', '内省笔记')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('Placeholder — entertainment / self-exploration copy only.', '占位 — 仅娱乐与自我探索文案。')}
          </p>
        </section>
        <section className="rounded-[var(--os-radius-card)] border border-dashed border-border p-5">
          <h2 className="font-serif text-lg font-medium">{t('Related piece', '相关器物')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('Placeholder — link to matching Five Elements PDP / The Making.', '占位 — 链向对应五行 PDP / 造物记。')}
          </p>
          <Link href="/origins/the-making" className="mt-3 inline-flex text-sm underline-offset-4 hover:underline">
            {t('Browse The Making →', '浏览造物记 →')}
          </Link>
        </section>
      </article>

      <Disclaimer variant="full" locale={locale} className="mt-12" />
    </PageShell>
  );
}
