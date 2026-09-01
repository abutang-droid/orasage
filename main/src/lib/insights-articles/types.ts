export type InsightsPillar = 'day-master' | 'five-elements' | 'solar-terms' | 'crystal';

export type LocalizedParagraph = { en: string; zh: string };

export type InsightsArticle = {
  pillar: InsightsPillar;
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  publishedAt: string;
  paragraphs: LocalizedParagraph[];
};

export type InsightsPillarIntro = {
  pillar: InsightsPillar;
  paragraphs: LocalizedParagraph[];
};
