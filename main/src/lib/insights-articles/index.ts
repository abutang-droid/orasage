import type { InsightsPillarIntro } from './types';
import { CRYSTAL_ARTICLES } from './crystal';
import { DAY_MASTER_ARTICLES } from './day-master';
import { FIVE_ELEMENTS_ARTICLES } from './five-elements';
import { SOLAR_TERMS_ARTICLES } from './solar-terms';
import type { InsightsArticle, InsightsPillar } from './types';

export type { InsightsArticle, InsightsPillar, LocalizedParagraph } from './types';

export const INSIGHTS_ARTICLES: InsightsArticle[] = [
  ...DAY_MASTER_ARTICLES,
  ...FIVE_ELEMENTS_ARTICLES,
  ...CRYSTAL_ARTICLES,
  ...SOLAR_TERMS_ARTICLES,
];

export const INSIGHTS_PILLAR_INTROS: InsightsPillarIntro[] = [
  {
    pillar: 'day-master',
    paragraphs: [
      {
        en: 'Day Master typology names the day stem in a BaZi chart — Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui — as reflective archetypes. The ten stems are vocabulary for structure: how you prefer to start, hold, cut, or flow. They are not verdicts on luck, talent, or destiny.',
        zh: '日主人格学把八字日干——甲、乙、丙、丁、戊、己、庚、辛、壬、癸——称作内省原型。十天干是结构的词汇：你偏向如何启动、托住、切断或流动。它们不是对运气、天赋或命运的裁决。',
      },
      {
        en: 'Read these essays beside a chart printout or a journal, not instead of professional advice. Each piece ends with a prompt you can try without believing the metaphor literally.',
        zh: '请与命盘打印件或日记并读，而非替代专业建议。每篇末尾有一个可实践的提示，无需把隐喻当真。',
      },
    ],
  },
  {
    pillar: 'five-elements',
    paragraphs: [
      {
        en: 'Five Elements (Wood, Fire, Earth, Metal, Water) describe cyclic grammar in Chinese cosmology — how phases hand off, constrain, and reshape each other. We use them as symbolic labels for habits and seasons, not as chemistry or medicine.',
        zh: '五行（木火土金水）描述中国宇宙观里的循环语法——阶段如何交接、约束与重塑。我们把它当作习惯与季节的象征标签，而非化学或医学。',
      },
      {
        en: 'When a chart emphasizes one element, treat it as a spotlight on themes to observe, not a deficit to fix with products or rituals.',
        zh: '当盘里某一元素偏重，把它当作值得观察的主题聚光灯，而不是需要用产品或仪式去「补齐」的缺口。',
      },
    ],
  },
  {
    pillar: 'solar-terms',
    paragraphs: [
      {
        en: 'The twenty-four solar terms divide the year by sun angle and agrarian memory — planting, heat, harvest, storage. We publish notes on a few anchor terms as cultural timestamps.',
        zh: '二十四节气按太阳角度与农事记忆切分一年——播种、暑热、收获、储藏。我们刊发若干锚点节气作为文化时间戳。',
      },
      {
        en: 'No yearly forecasts appear here. Solar-term essays suggest observational rituals — walks, inventories, meals — that mark time without predicting yours.',
        zh: '此处不含流年预测。节气短文建议观察性仪式——散步、盘点、餐食——用来标记时间，而非预测你的时间。',
      },
    ],
  },
  {
    pillar: 'crystal',
    paragraphs: [
      {
        en: 'Crystal Companion essays describe OraSage bracelets as intention objects: material facts, craft choices, and prompts you assign yourself. Jewelry can remind; it cannot guarantee outcomes.',
        zh: '水晶志短文把 OraSage 手串描述为意图物件：材质事实、工艺选择与你自己指定的提示。器物可以提醒，不能担保结果。',
      },
      {
        en: 'Specs and pricing live on Shop; longer craft narratives live in The Making. Cross-read those pages when you want verifiable details.',
        zh: '规格与价格在商城；更长工艺叙事在造物记。需要可核验细节时请交叉阅读。',
      },
    ],
  },
];

const articleIndex = new Map<string, InsightsArticle>(
  INSIGHTS_ARTICLES.map((a) => [`${a.pillar}/${a.slug}`, a]),
);

export function getInsightsArticle(pillar: string, slug: string): InsightsArticle | undefined {
  return articleIndex.get(`${pillar}/${slug}`);
}

export function getArticlesByPillar(pillar: InsightsPillar): InsightsArticle[] {
  return INSIGHTS_ARTICLES.filter((a) => a.pillar === pillar);
}

export function getPillarIntro(pillar: InsightsPillar) {
  return INSIGHTS_PILLAR_INTROS.find((p) => p.pillar === pillar);
}

export function getLatestInsightsArticles(limit = 8): InsightsArticle[] {
  return [...INSIGHTS_ARTICLES]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function insightsArticlePath(pillar: InsightsPillar, slug: string): string {
  return `/insights/${pillar}/${slug}`;
}

export function isInsightsPillar(value: string): value is InsightsPillar {
  return (
    value === 'day-master' ||
    value === 'five-elements' ||
    value === 'solar-terms' ||
    value === 'crystal'
  );
}

export const INSIGHTS_ARTICLE_COUNT = INSIGHTS_ARTICLES.length;
