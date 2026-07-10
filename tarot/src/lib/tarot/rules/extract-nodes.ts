import { getCardKnowledge } from '@/lib/tarot/knowledge';
import type { ExtractedKnowledgeNode } from '@/lib/tarot/knowledge/types';
import { TOPIC_LABELS, type ReadingTopic } from './topics';

const TOPIC_SCENARIO_TEMPLATES: Record<ReadingTopic, (kw: string, name: string) => string> = {
  love: (kw, name) => `在感情议题中，${name}的「${kw}」能量影响连结方式与期待。`,
  career: (kw, name) => `在事业场域，${name}提示「${kw}」与职场节奏、角色定位相关。`,
  wealth: (kw, name) => `在财务层面，${name}映照「${kw}」与资源流动、价值判断。`,
  study: (kw, name) => `在学业路径上，${name}关联「${kw}」与学习状态、目标聚焦。`,
  family: (kw, name) => `在家庭议题里，${name}触及「${kw}」与归属感、责任边界。`,
  relationship: (kw, name) => `在人际互动中，${name}呈现「${kw}」与沟通、信任动态。`,
  growth: (kw, name) => `在自我成长上，${name}呼应「${kw}」与内在转化、方向感。`,
  decision: (kw, name) => `在抉择时刻，${name}围绕「${kw}」揭示取舍与时机。`,
  general: (kw, name) => `在当下处境中，${name}的「${kw}」能量值得被看见。`,
};

export type CardSlotInput = {
  cardId: number;
  cardName: string;
  cardNameEn?: string;
  orientation: '正位' | '逆位';
  element: string;
  position?: string;
  positionLabel?: string;
};

/** 从知识库按主题裁剪单牌知识节点 */
export function extractKnowledgeNode(
  slot: CardSlotInput,
  topic: ReadingTopic,
): ExtractedKnowledgeNode | null {
  const knowledge = getCardKnowledge(slot.cardId);
  if (!knowledge) return null;

  const orient = slot.orientation === '正位' ? knowledge.upright : knowledge.reversed;
  const primaryKw = orient.keywords[0] ?? knowledge.element;
  const topicScenario = TOPIC_SCENARIO_TEMPLATES[topic](primaryKw, knowledge.name);
  const matchedScenario =
    orient.scenarios.find((s) => s.includes(TOPIC_LABELS[topic].zh.slice(0, 1))) ??
    orient.scenarios[0] ??
    topicScenario;

  return {
    cardId: slot.cardId,
    cardName: slot.cardName || knowledge.name,
    cardNameEn: slot.cardNameEn || knowledge.nameEn,
    orientation: slot.orientation,
    element: slot.element || knowledge.element,
    position: slot.position,
    positionLabel: slot.positionLabel,
    topic,
    keywords: orient.keywords,
    meaning: orient.meaning,
    scenario: topic === 'general' ? matchedScenario : topicScenario,
    advice: orient.advice,
  };
}

export function extractKnowledgeNodes(
  slots: CardSlotInput[],
  topic: ReadingTopic,
): ExtractedKnowledgeNode[] {
  return slots
    .map((s) => extractKnowledgeNode(s, topic))
    .filter((n): n is ExtractedKnowledgeNode => n !== null);
}
