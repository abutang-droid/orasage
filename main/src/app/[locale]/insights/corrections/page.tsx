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
    pathname: '/insights/corrections',
    title: isZh ? '勘误 | OraSage' : 'Corrections | OraSage',
    description: isZh
      ? '已刊内容的公开勘误记录。'
      : 'Public correction log for published pieces.',
  });
}

export default async function CorrectionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  return (
    <PageShell hideBack className="max-w-3xl">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          {t('Home', '首页')}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/insights" className="hover:text-foreground">
          {t('Insights', '玄析')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t('Corrections', '勘误')}</span>
      </nav>

      <PageTitle>{t('Corrections', '勘误')}</PageTitle>
      <PageLead>
        {t(
          'When we find an error in a published piece, we log it here.',
          '发现已刊文错误时，我们会在此公开记录。',
        )}
      </PageLead>

      <Disclaimer variant="compact" locale={locale} className="mt-6" />

      <section className="mt-10 space-y-4 text-sm text-muted-foreground">
        <p>
          {t(
            'Nothing to correct yet — this log activates when a published piece needs a fix.',
            '目前没有需要更正的内容——发布后若有勘误，才会启用本页。',
          )}
        </p>
        <p>
          <Link href="/insights" className="text-foreground underline-offset-4 hover:underline">
            {t('← Back to Insights', '← 返回玄析')}
          </Link>
        </p>
      </section>

      <Disclaimer variant="standard" locale={locale} className="mt-12" />
    </PageShell>
  );
}
