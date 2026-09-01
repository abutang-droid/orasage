import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';
import {
  isMakingSku,
  isMakingLiveSku,
  getMakingStory,
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
  const story = getMakingStory(sku);
  const isZh = locale.startsWith('zh');
  const title = isZh ? m.nameZh : m.nameEn;
  const description = story
    ? isZh
      ? story.leadZh
      : story.leadEn
    : isZh
      ? `${m.elementZh}行造物记 — 材料与工艺，非功效承诺。`
      : `${m.elementEn} making story — materials and craft, not outcome claims.`;
  return buildPortalPageMeta({
    locale,
    pathname: `/origins/the-making/${sku}`,
    title: `${title} · The Making | OraSage`,
    description,
  });
}

export default async function TheMakingSkuPage({ params }: Props) {
  const { locale, sku } = await params;
  if (!isMakingSku(sku)) notFound();
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);
  const m = MAKING_META[sku as MakingSku];
  const live = isMakingLiveSku(sku);
  const story = getMakingStory(sku as MakingSku);
  const published = live && story;
  const notifyHref = `mailto:hello@orasage.com?subject=${encodeURIComponent(
    `Notify me: The Making / ${sku}`,
  )}`;

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
        {published
          ? isZh
            ? story.leadZh
            : story.leadEn
          : live
            ? t(
                'Finished piece facts you can verify now. The longer craft story is still being written.',
                '现在就能核验的成品信息。更长的造物叙事仍在撰写中。',
              )
            : t(
                'This making story is still in progress. Verifiable product details live on the Shop page.',
                '这篇造物记仍在撰写中。可核验的商品信息在商城单品页。',
              )}
      </PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <section className="mt-8 space-y-4 rounded-[var(--os-radius-card,1rem)] border border-border bg-card p-5">
        <h2 className="font-serif text-lg font-medium text-foreground">
          {t('1 · The finished piece', '1 · 成品')}
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">{t('Material', '材质')}</dt>
            <dd className="text-foreground">{isZh ? m.specs.materialZh : m.specs.materialEn}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('Bead size', '珠径')}</dt>
            <dd className="text-foreground">{m.specs.beadMm}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('Wrist fit', '腕围')}</dt>
            <dd className="text-foreground">{isZh ? m.specs.wristZh : m.specs.wristEn}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('Finish', '处理方式')}</dt>
            <dd className="text-foreground">{isZh ? m.specs.finishZh : m.specs.finishEn}</dd>
          </div>
        </dl>
      </section>

      {published ? (
        <div className="mt-10 space-y-10">
          {story.sections.map((section) => (
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
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          {t(
            "We're still writing this one… What's verifiable now is on the product page.",
            '这一篇还在写……现在就能核验的信息在商品页上。',
          )}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={shopPdpUrl(sku)}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background"
        >
          {t('See the piece in Shop →', '查看商城单品 →')}
        </a>
        {!published ? (
          <a
            href={notifyHref}
            className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('Notify me when this goes live →', '成稿后通知我 →')}
          </a>
        ) : (
          <Link
            href="/insights/crystal"
            className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('Crystal Companion essays →', '水晶志短文 →')}
          </Link>
        )}
      </div>

      <Disclaimer variant="product" locale={locale} className="mt-10" />
    </PageShell>
  );
}
