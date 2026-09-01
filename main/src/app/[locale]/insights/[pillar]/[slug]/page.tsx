import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { buildPortalPageMeta } from '@/lib/seo';
import {
  getInsightsArticle,
  INSIGHTS_ARTICLES,
  isInsightsPillar,
} from '@/lib/insights-articles';
import { InsightsArticleView } from '@/lib/insights-article-view';

const PILLAR_META: Record<
  string,
  { titleEn: string; titleZh: string; path: string }
> = {
  'day-master': {
    path: '/insights/day-master',
    titleEn: 'Day Master Typology',
    titleZh: '日主人格学',
  },
  'five-elements': {
    path: '/insights/five-elements',
    titleEn: 'Five Elements Decoded',
    titleZh: '五行解码',
  },
  'solar-terms': {
    path: '/insights/solar-terms',
    titleEn: '24 Solar Terms',
    titleZh: '节气与流年',
  },
  crystal: {
    path: '/insights/crystal',
    titleEn: 'Crystal Companion',
    titleZh: '水晶志',
  },
};

type Props = { params: Promise<{ locale: string; pillar: string; slug: string }> };

export function generateStaticParams() {
  return INSIGHTS_ARTICLES.map((a) => ({ pillar: a.pillar, slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pillar, slug } = await params;
  if (!isInsightsPillar(pillar)) return {};
  const article = getInsightsArticle(pillar, slug);
  if (!article) return {};
  const isZh = locale.startsWith('zh');
  return buildPortalPageMeta({
    locale,
    pathname: `/insights/${pillar}/${slug}`,
    title: `${isZh ? article.titleZh : article.titleEn} | OraSage`,
    description: isZh ? article.descriptionZh : article.descriptionEn,
  });
}

export default async function InsightsArticlePage({ params }: Props) {
  const { locale, pillar, slug } = await params;
  if (!isInsightsPillar(pillar)) notFound();
  const article = getInsightsArticle(pillar, slug);
  if (!article) notFound();
  setRequestLocale(locale);
  const pillarMeta = PILLAR_META[pillar];

  return (
    <InsightsArticleView
      locale={locale}
      article={article}
      pillarTitleEn={pillarMeta.titleEn}
      pillarTitleZh={pillarMeta.titleZh}
      pillarPath={pillarMeta.path}
    />
  );
}
