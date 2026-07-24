import {
  isNonChineseAiLocale,
  type AiLocale,
} from '../../../../../shared/ai-locale/index';
import { cardNameForAi, orientationForAi } from '../../i18n/card-locale';
import { classifyReadingTopic } from './classify-topic';
import { extractKnowledgeNodes, type CardSlotInput } from './extract-nodes';
import { TOPIC_LABELS, type ReadingTopic } from './topics';
import type { ExtractedKnowledgeNode } from '../knowledge/types';

export type ReadingContextInput = {
  question?: string;
  answers?: Array<{ answer: string; questionId?: string; question?: string }>;
  cards: CardSlotInput[];
  spreadType?: string;
  nickname?: string | null;
  language?: AiLocale;
};

export type ReadingContext = {
  question: string;
  topic: ReadingTopic;
  topicLabel: string;
  topicConfidence: number;
  spreadType: string;
  nickname: string | null;
  language: AiLocale;
  nodes: ExtractedKnowledgeNode[];
  answerSummary: string;
};

export function buildReadingContext(input: ReadingContextInput): ReadingContext {
  const {
    question = '',
    answers = [],
    cards,
    spreadType = 'single',
    nickname = null,
    language = 'zh-CN',
  } = input;

  const classification = classifyReadingTopic({ question, answers });
  const nodes = extractKnowledgeNodes(cards, classification.topic);
  const answerSummary = answers.length
    ? answers.map((a) => `${a.question ?? ''} → ${a.answer}`).join('；')
    : '';

  const topicLabel =
    language === 'en' || language === 'pt-BR'
      ? TOPIC_LABELS[classification.topic].en
      : TOPIC_LABELS[classification.topic].zh;

  return {
    question: question.trim() || (language === 'en' ? 'General guidance' : '当下指引'),
    topic: classification.topic,
    topicLabel,
    topicConfidence: classification.confidence,
    spreadType,
    nickname,
    language,
    nodes,
    answerSummary,
  };
}

/** 供 AI 层消费的内部知识摘要（禁止原样输出给用户） */
export function formatKnowledgeForPrompt(ctx: ReadingContext): string {
  const nonZh = isNonChineseAiLocale(ctx.language);
  return ctx.nodes
    .map((n, i) => {
      const name = cardNameForAi(n, ctx.language);
      const orient = orientationForAi(ctx.language, n.orientation);
      if (nonZh) {
        const pos = n.positionLabel ? `${n.positionLabel}: ` : `Card ${i + 1}: `;
        return [
          `${pos}${name} (${orient}) · element ${n.element}`,
          `  [Internal Chinese source — digest only, never copy verbatim]`,
          `  Theme angle (zh): ${n.scenario}`,
          `  Keywords (zh): ${n.keywords.join(', ')}`,
          `  Book meaning (zh): ${n.meaning}`,
          `  Advice seeds (zh): ${n.advice.join(' / ')}`,
          `  Rewrite all of the above into ${ctx.language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English'} for the user.`,
        ].join('\n');
      }
      const pos = n.positionLabel ? `${n.positionLabel}：` : `牌 ${i + 1}：`;
      return [
        `${pos}${name}（${orient}）· ${n.element}元素`,
        `  主题角度：${n.scenario}`,
        `  关键词：${n.keywords.join('、')}`,
        `  书义参考：${n.meaning}`,
        `  建议素材：${n.advice.join(' / ')}`,
      ].join('\n');
    })
    .join('\n\n');
}
