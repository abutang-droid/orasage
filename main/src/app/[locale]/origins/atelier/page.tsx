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
    pathname: '/origins/atelier',
    title: isZh ? '工坊 | OraSage' : 'Atelier | OraSage',
    description: isZh ? '制作、品控与包装流程。' : 'How pieces are made, inspected, and packed.',
  });
}

export default async function AtelierPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  return (
    <PageShell>
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
          'Workshop process — selection, finishing, stringing, QC, and packing. Full walkthrough later.',
          '工坊流程骨架 — 选石、抛光、串制、品控与包装。完整图文稍后上线。',
        )}
      </PageLead>
      <Disclaimer variant="compact" locale={locale} className="mt-6" />
    </PageShell>
  );
}
