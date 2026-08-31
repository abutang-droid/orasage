import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';
import {
  isMakingSku,
  MAKING_META,
  MAKING_SKUS,
  shopPdpUrl,
  type MakingSku,
} from '@/lib/origins-making';

type Props = { params: Promise<{ locale: string; sku: string }> };

export function generateStaticParams() {
  return MAKING_SKUS.map((sku) => ({ sku }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, sku } = await params;
  if (!isMakingSku(sku)) return {};
  const m = MAKING_META[sku];
  const isZh = locale.startsWith('zh');
  const title = isZh ? m.nameZh : m.nameEn;
  return buildPortalPageMeta({
    locale,
    pathname: `/origins/the-making/${sku}`,
    title: `${title} · The Making | OraSage`,
    description: isZh
      ? `${m.elementZh}行造物记 — 材料与工艺，非功效承诺。`
      : `${m.elementEn} making story — materials and craft, not outcome claims.`,
  });
}

const SCREENS = [
  { id: 's1', en: '1 · Hero', zh: '1 · 成品' },
  { id: 's2', en: '2 · The Source', zh: '2 · 典籍出处' },
  { id: 's3', en: '3 · Translation', zh: '3 · 设计翻译' },
  { id: 's4', en: '4 · Material & making', zh: '4 · 材料与制作' },
  { id: 's5', en: '5 · Wear & care', zh: '5 · 佩戴与保养' },
  { id: 's6', en: '6 · Shop', zh: '6 · 选购' },
  { id: 's7', en: '7 · Disclaimer', zh: '7 · 声明' },
] as const;

export default async function TheMakingSkuPage({ params }: Props) {
  const { locale, sku } = await params;
  if (!isMakingSku(sku)) notFound();
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);
  const m = MAKING_META[sku as MakingSku];

  return (
    <PageShell hideBack className="max-w-3xl">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/origins" className="hover:text-foreground">
          {t('Origins', '造物')}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/origins/the-making" className="hover:text-foreground">
          {t('The Making', '造物记')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{isZh ? m.elementZh : m.elementEn}</span>
      </nav>

      <p className="text-sm tracking-wide text-muted-foreground">
        {isZh ? `${m.elementZh} · ${m.intentionZh}` : `${m.elementEn} · ${m.intentionEn}`} · $168
      </p>
      <PageTitle>{isZh ? m.nameZh : m.nameEn}</PageTitle>
      <PageLead>
        {t(
          'Seven-screen making story skeleton. Full copy, timeline, and verification land in content batches.',
          '七屏造物记骨架。完整文案、时间轴与验真段将在内容批次上线。',
        )}
      </PageLead>

      <a
        href={shopPdpUrl(sku)}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        {t('See the piece in Shop →', '查看商城单品 →')}
      </a>

      <div className="mt-10 space-y-6">
        {SCREENS.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="rounded-[var(--os-radius-card)] border border-dashed border-border p-5"
          >
            <h2 className="font-serif text-lg font-medium text-foreground">{isZh ? s.zh : s.en}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('Placeholder screen — content forthcoming.', '占位屏 — 内容待上线。')}
            </p>
            {s.id === 's6' ? (
              <a
                href={shopPdpUrl(sku)}
                className="mt-3 inline-flex text-sm text-foreground underline-offset-4 hover:underline"
              >
                {t('Shop this piece →', '购买本款 →')}
              </a>
            ) : null}
            {s.id === 's7' ? (
              <Disclaimer variant="product" locale={locale} className="mt-4" />
            ) : null}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
