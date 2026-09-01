import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

const STEPS: { titleEn: string; titleZh: string; bodyEn: string; bodyZh: string }[] = [
  {
    titleEn: '1 · Stone selection',
    titleZh: '1 · 选石',
    bodyEn:
      'Beads are sorted by diameter (8 mm target), surface finish, and visible structure. Lots with sharp chips at the drill hole or heavy fractures are rejected. Colorways differ by SKU; the inspection checklist stays the same.',
    bodyZh:
      '按直径（目标 8 mm）、表面光洁度与可见结构分拣。钻孔处尖锐崩口或严重裂隙的批次剔除。各 SKU 配色不同；检查清单相同。',
  },
  {
    titleEn: '2 · Cord and knotting',
    titleZh: '2 · 穿线与打结',
    bodyEn:
      'Waxed cord is hand-knotted between beads so a single break does not spill the strand. Ends finish in an adjustable sliding knot for roughly 15–18 cm wrists. No metal findings on the standard SKU.',
    bodyZh:
      '蜡线在珠间手工打结，单点断裂不易整串散落。末端为可调滑结，约适配 15–18 cm 腕围。标准 SKU 无金属配件。',
  },
  {
    titleEn: '3 · Fit and photo QC',
    titleZh: '3 · 尺码与拍照质检',
    bodyEn:
      'Finished loops are checked on a sizing mandrel. We record bead count, slider travel, and a scale-card photo before packing. Ritual language does not appear on the checklist.',
    bodyZh:
      '成品圈在量腕棒上检查。装箱前记录珠数、滑结行程与比例尺照片。清单不含仪式用语。',
  },
  {
    titleEn: '4 · Packing',
    titleZh: '4 · 包装',
    bodyEn:
      'Each piece ships with material and size on the card, a care note (dry wipe, soft pouch, keep solvents off the wax), and a link back to The Making story for that SKU.',
    bodyZh:
      '每件附材质与尺寸卡片、护理说明（干擦、软袋、溶剂远离蜡线），以及该 SKU 造物记链接。',
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: '/origins/atelier',
    title: isZh ? '工坊 | OraSage' : 'Atelier | OraSage',
    description: isZh
      ? '选石、穿线、质检与包装 — 五款共用的可核验流程。'
      : 'Selection, stringing, QC, and packing — the shared inspectable process for all five pieces.',
  });
}

export default async function AtelierPage({ params }: Props) {
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
        <span className="text-foreground">{t('Atelier', '工坊')}</span>
      </nav>

      <PageTitle>{t('Atelier', '工坊')}</PageTitle>
      <PageLead>
        {t(
          'One workshop stack for five colorways: how beads are chosen, knotted, checked, and packed — without outcome claims.',
          '五款配色共用一套工坊流程：如何选珠、打结、检查与包装——不做结果承诺。',
        )}
      </PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <div className="mt-10 space-y-10">
        {STEPS.map((step) => (
          <section key={step.titleEn} className="space-y-3">
            <h2 className="font-serif text-lg font-medium text-foreground">
              {isZh ? step.titleZh : step.titleEn}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isZh ? step.bodyZh : step.bodyEn}
            </p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm">
        <Link
          href="/origins/the-making"
          className="text-foreground underline-offset-4 hover:underline"
        >
          {t('Read The Making stories →', '阅读造物记 →')}
        </Link>
        {' · '}
        <Link href="/origins/our-story" className="text-foreground underline-offset-4 hover:underline">
          {t('Our Story →', '缘起 →')}
        </Link>
      </p>

      <Disclaimer variant="product" locale={locale} className="mt-12" />
    </PageShell>
  );
}
