import { getCardById } from '@/lib/tarot/cards';
import { CARD_KNOWLEDGE_REGISTRY } from './registry';
import type { CardKnowledge, ExtractedKnowledgeNode, OrientationKnowledge } from './types';
import type { ReadingTopic } from '../rules/topics';

export type { CardKnowledge, ExtractedKnowledgeNode, OrientationKnowledge };

/** 获取单张牌完整结构化知识 */
export function getCardKnowledge(cardId: number): CardKnowledge | null {
  return CARD_KNOWLEDGE_REGISTRY.get(cardId) ?? null;
}

/** 获取指定牌位知识切片 */
export function getOrientationKnowledge(
  cardId: number,
  orientation: '正位' | '逆位',
): OrientationKnowledge | null {
  const k = getCardKnowledge(cardId);
  if (!k) return null;
  return orientation === '正位' ? k.upright : k.reversed;
}

/** 字面释义（第一层直接输出，不经 AI 改写） */
export function getLiteralMeaning(cardId: number, orientation: '正位' | '逆位'): string | null {
  return getOrientationKnowledge(cardId, orientation)?.meaning ?? null;
}

/** 知识库规模校验 */
export function getKnowledgeStats() {
  return { cardCount: CARD_KNOWLEDGE_REGISTRY.size };
}

/** 按 cardId 或牌名回退查找 */
export function resolveCardKnowledge(cardId: number, cardName?: string): CardKnowledge | null {
  const byId = getCardKnowledge(cardId);
  if (byId) return byId;
  if (!cardName) return null;
  const meta = getCardById(cardId);
  if (meta) return getCardKnowledge(meta.id);
  for (const k of CARD_KNOWLEDGE_REGISTRY.values()) {
    if (k.name === cardName || k.nameEn === cardName) return k;
  }
  return null;
}

/** 导出供规则层使用的原始节点字段 */
export function toKnowledgeBase(node: ExtractedKnowledgeNode): {
  keywords: string[];
  meaning: string;
  scenario: string;
  advice: string[];
} {
  return {
    keywords: node.keywords,
    meaning: node.meaning,
    scenario: node.scenario,
    advice: node.advice,
  };
}

export type { ReadingTopic };
