/**
 * 塔罗解读三层架构
 *
 * 第一层（知识层）  → knowledge/   78 张牌结构化知识库
 * 第二层（规则层）  → rules/       问题分类 + 知识节点提取
 * 第三层（生成层）  → generation/  LLM 自然语言解读（禁止复述知识库）
 */
export {
  getCardKnowledge,
  getOrientationKnowledge,
  getLiteralMeaning,
  getKnowledgeStats,
  resolveCardKnowledge,
} from './knowledge';

export { classifyReadingTopic, TOPIC_LABELS } from './rules/classify-topic';
export { extractKnowledgeNode, extractKnowledgeNodes } from './rules/extract-nodes';
export { buildReadingContext, formatKnowledgeForPrompt } from './rules/build-context';

export {
  generateSingleCardFullFromLayers,
  generateSpreadFullFromLayers,
  generateSpreadBriefFromLayers,
  generateDailyFortuneFromLayers,
  generateLiteralMeaningFromLayers,
} from './generation/generate';

export type { ReadingTopic } from './rules/topics';
export type { CardKnowledge, ExtractedKnowledgeNode } from './knowledge/types';
export type { ReadingContext, ReadingContextInput } from './rules/build-context';
