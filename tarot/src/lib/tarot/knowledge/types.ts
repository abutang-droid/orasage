import type { ReadingTopic } from '../rules/topics';

/** 单牌位（正/逆）结构化知识 */
export interface OrientationKnowledge {
  keywords: string[];
  /** 韦特书义（字面释义） */
  meaning: string;
  /** 典型生活场景（通用，非个性化） */
  scenarios: string[];
  /** 标准行动建议（通用） */
  advice: string[];
}

/** 78 张牌标准知识节点 */
export interface CardKnowledge {
  cardId: number;
  name: string;
  nameEn: string;
  element: string;
  arcana: 'major' | 'minor';
  suit?: string;
  upright: OrientationKnowledge;
  reversed: OrientationKnowledge;
}

/** 规则层按主题裁剪后的知识节点（供 AI 层消费，禁止直接输出） */
export interface ExtractedKnowledgeNode {
  cardId: number;
  cardName: string;
  cardNameEn: string;
  orientation: '正位' | '逆位';
  element: string;
  position?: string;
  positionLabel?: string;
  topic: ReadingTopic;
  keywords: string[];
  meaning: string;
  scenario: string;
  advice: string[];
}
