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
    pathname: '/origins/our-story',
    title: isZh ? '缘起 | OraSage' : 'Our Story | OraSage',
    description: isZh
      ? 'OraSage 为何以内容电商方式讲述五行与器物。'
      : 'Why OraSage builds content commerce around Five Elements and craft.',
  });
}

export default async function OurStoryPage({ params }: Props) {
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
        <span className="text-foreground">{t('Our Story', '缘起')}</span>
      </nav>
      <PageTitle>{t('Our Story', '缘起')}</PageTitle>
      <PageLead>
        {t(
          'Brand origin shell — “know the structure, do not ask fortune.” Full narrative later.',
          '品牌缘起骨架 — 「知结构，不问吉凶」。完整叙事稍后上线。',
        )}
      </PageLead>
      <Disclaimer variant="compact" locale={locale} className="mt-6" />
    </PageShell>
  );
}
