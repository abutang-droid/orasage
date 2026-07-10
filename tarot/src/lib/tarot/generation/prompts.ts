import type { ReadingContext } from '../rules/build-context';
import { formatKnowledgeForPrompt } from '../rules/build-context';
import { aiPromptLanguageLine } from '../../../../../shared/ai-locale/index';

/** 第三层统一文风约束：消化知识库，禁止复述 */
export const TAROT_GENERATION_STYLE = `生成要求（第三层）：
1. 已提供结构化知识节点（关键词/场景/书义/建议），请消化后用自己的话写解读。
2. 禁止大段照搬「书义参考」原文；禁止罗列关键词；不要像百科词条。
3. 把知识节点融入用户问题与处境，给出自然、连贯、有温度的回答。
4. 语气像懂牌的朋友；不说绝对话；逆位不是凶兆。
5. 禁止出现 AI、人工智能、语言模型、作为助手 等元信息。
6. 不预测死亡/疾病/事故；不给医疗、法律、投资建议。`;

export function buildSingleFullPrompt(ctx: ReadingContext): string {
  const node = ctx.nodes[0];
  return `${aiPromptLanguageLine(ctx.language)}
用户核心问题：${ctx.question}
问题主题：${ctx.topicLabel}（规则层分类）

引导问答：
${ctx.answerSummary || '（无）'}

抽到的牌：${node?.cardName ?? ''} · ${node?.orientation ?? ''}

【内部知识节点 — 仅供推理，禁止原样输出】
${formatKnowledgeForPrompt(ctx)}

${TAROT_GENERATION_STYLE}

请返回单牌阵详读 JSON：
{
  "cards": [{ "interpretation": "结合用户处境的解读 120-200字，直接回答问题", "mantra": "一句箴言 12字内" }],
  "synthesis": "综合答案 150-250字，明确回应用户问题",
  "suggestions": ["行动建议1", "行动建议2", "行动建议3"],
  "affirmation": "肯定语 15-25字，第一人称"
}`;
}

export function buildSpreadFullPrompt(ctx: ReadingContext): string {
  const cardCount = ctx.nodes.length;
  return `${aiPromptLanguageLine(ctx.language)}
用户问题：${ctx.question}
问题主题：${ctx.topicLabel}
牌阵：${ctx.spreadType}

引导问答：
${ctx.answerSummary || '（无）'}

【内部知识节点 — 仅供推理，禁止原样输出】
${formatKnowledgeForPrompt(ctx)}

${TAROT_GENERATION_STYLE}

请返回 JSON：
{
  "cards": [{ "interpretation": "单牌解读 80-150字", "mantra": "一句箴言 12字内" }],
  "synthesis": "综合解读 200-350字",
  "suggestions": ["建议1", "建议2", "建议3"],
  "affirmation": "肯定语 15-25字，第一人称"
}
cards 数组长度必须等于 ${cardCount}。`;
}

export function buildSpreadBriefPrompt(ctx: ReadingContext): string {
  const cardCount = ctx.nodes.length;
  return `${aiPromptLanguageLine(ctx.language)}
用户问题：${ctx.question}
问题主题：${ctx.topicLabel}

【内部知识节点 — 仅供推理，禁止原样输出】
${formatKnowledgeForPrompt(ctx)}

${TAROT_GENERATION_STYLE}

请生成简读 JSON（简短，不剧透完整详读）：
{
  "perCard": [{ "position": "位置名", "text": "单牌简读 40-70字" }],
  "synthesis": "综合简读 80-120字"
}
perCard 数组长度必须等于 ${cardCount}。`;
}

export function buildDailyFortunePrompt(ctx: ReadingContext): string {
  const node = ctx.nodes[0];
  return `${aiPromptLanguageLine(ctx.language)}
用户：${ctx.nickname || '旅人'}
今日主牌：${node?.cardName}（${node?.orientation}）
关注主题：${ctx.topicLabel}

引导问答：
${ctx.answerSummary || '（无）'}

【内部知识节点 — 仅供推理，禁止原样输出】
${formatKnowledgeForPrompt(ctx)}

${TAROT_GENERATION_STYLE}

请生成每日运势 JSON：
{
  "brief": "访客可见简报 80-120字",
  "full": {
    "work": { "tag": "2-4字标签", "text": "工作维度 60-100字" },
    "love": { "tag": "...", "text": "爱情维度" },
    "career": { "tag": "...", "text": "事业维度" },
    "wealth": { "tag": "...", "text": "财运维度" },
    "summary": "综合总结 100-150字"
  }
}`;
}

export function buildLiteralTranslatePrompt(
  meaning: string,
  cardName: string,
  cardNameEn: string,
  orientation: string,
  language: ReadingContext['language'],
): string {
  return `${aiPromptLanguageLine(language)}
牌名：${cardName} / ${cardNameEn}
牌位：${orientation}

以下是一条韦特塔罗牌的标准字面释义（书义），请仅翻译为对应语言，不要添加个性化解读：
${meaning}

只输出翻译后的释义正文，不要引号、不要 JSON、不要标题。`;
}
