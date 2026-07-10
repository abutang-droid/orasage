import { ALL_CARDS, type TarotCardData } from '@/lib/tarot/cards';
import fatemasterRaw from '../../../../fatemaster_tarot_knowledge.json';
import type { CardKnowledge, OrientationKnowledge } from './types';

type FatemasterCard = {
  name: string;
  brief_meaning?: string;
  upright_keywords?: string[];
  reversed_keywords?: string[];
};

const fatemasterByName = new Map<string, FatemasterCard>();
for (const c of (fatemasterRaw as { cards: FatemasterCard[] }).cards) {
  fatemasterByName.set(c.name.toLowerCase(), c);
}

const SUIT_SCENARIOS: Record<string, string[]> = {
  wands: ['行动力与热情的抉择', '新项目或创意的启动', '竞争与野心的平衡'],
  cups: ['情感连结与内心需求', '关系中的付出与回应', '直觉与情绪的流动'],
  swords: ['思维僵局与真相面对', '沟通误解与立场冲突', '决断前的清晰与勇气'],
  pentacles: ['物质安全与长期积累', '工作与资源的分配', '身体与现实的根基'],
};

const MAJOR_SCENARIOS = [
  '人生阶段的转折与觉醒',
  '命运课题的显化与回应',
  '灵魂成长的关键节点',
];

function deriveAdvice(keywords: string[], meaning: string, orientation: '正位' | '逆位'): string[] {
  const kw = keywords.slice(0, 2).join('、') || '当下能量';
  const base =
    orientation === '正位'
      ? `顺势承接「${kw}」带来的机会，把行动落实在一件具体小事上。`
      : `先放慢节奏，检视「${kw}」背后被忽略的信号，再调整策略。`;
  const fromMeaning = meaning.length > 20 ? meaning.slice(0, 48).replace(/[。！？]$/, '') + '。' : meaning;
  return [base, fromMeaning];
}

function buildOrientation(
  card: TarotCardData,
  orientation: '正位' | '逆位',
  fm: FatemasterCard | undefined,
): OrientationKnowledge {
  const isUp = orientation === '正位';
  const keywords = isUp
    ? (fm?.upright_keywords?.length ? fm.upright_keywords : card.keywords)
    : (fm?.reversed_keywords?.length ? fm.reversed_keywords : card.keywords.map((k) => `逆位·${k}`));

  const meaning = isUp ? card.meaningUp : card.meaningDown;

  const scenarios: string[] = [];
  if (fm?.brief_meaning) scenarios.push(fm.brief_meaning);
  if (card.arcana === 'major') {
    scenarios.push(...MAJOR_SCENARIOS);
  } else if (card.suit && SUIT_SCENARIOS[card.suit]) {
    scenarios.push(...SUIT_SCENARIOS[card.suit]);
  }
  if (scenarios.length === 0) {
    scenarios.push(`${card.element}元素相关的日常处境`);
  }

  return {
    keywords,
    meaning,
    scenarios: [...new Set(scenarios)].slice(0, 4),
    advice: deriveAdvice(keywords, meaning, orientation),
  };
}

function buildCardKnowledge(card: TarotCardData): CardKnowledge {
  const fm = fatemasterByName.get(card.nameEn.toLowerCase());
  return {
    cardId: card.id,
    name: card.name,
    nameEn: card.nameEn,
    element: card.element,
    arcana: card.arcana,
    suit: card.suit,
    upright: buildOrientation(card, '正位', fm),
    reversed: buildOrientation(card, '逆位', fm),
  };
}

/** 78 张牌标准结构化知识库（模块加载时构建） */
export const CARD_KNOWLEDGE_REGISTRY: ReadonlyMap<number, CardKnowledge> = new Map(
  ALL_CARDS.map((c) => [c.id, buildCardKnowledge(c)]),
);
