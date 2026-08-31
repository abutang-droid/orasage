import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle, PageLead } from '@/components/PageShell';
import { buildPortalPageMeta } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: '/search',
    title: isZh ? '搜索 | OraSage' : 'Search | OraSage',
    description: isZh ? '搜索玄析、造物与测算内容。' : 'Search Insights, Origins, and Readings.',
  });
}

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);

  return (
    <PageShell>
      <PageTitle>{t('Search', '搜索')}</PageTitle>
      <PageLead>
        {t(
          'Full-site search is coming. Meanwhile browse Insights, Origins, Readings, or Dao Canon.',
          '全站搜索即将上线。可先浏览玄析、造物、测算或道藏。',
        )}
      </PageLead>
      <ul className="mt-8 space-y-3 text-sm">
        <li>
          <Link href="/insights" className="underline-offset-4 hover:underline">
            {t('Insights', '玄析')}
          </Link>
        </li>
        <li>
          <Link href="/origins" className="underline-offset-4 hover:underline">
            {t('Origins', '造物')}
          </Link>
        </li>
        <li>
          <Link href="/readings" className="underline-offset-4 hover:underline">
            {t('Readings', '测算')}
          </Link>
        </li>
        <li>
          <Link href="/daozang" className="underline-offset-4 hover:underline">
            {t('Dao Canon', '道藏')}
          </Link>
        </li>
      </ul>
    </PageShell>
  );
}
