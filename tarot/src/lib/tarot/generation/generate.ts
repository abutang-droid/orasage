import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { TAROT_READER_SYSTEM } from '@/lib/llm/prompts';
import { sanitizeTarotFullReport, sanitizeTarotReaderText } from '@/lib/llm/sanitize-output';
import { getLiteralMeaning } from '@/lib/tarot/knowledge';
import { buildReadingContext, type ReadingContextInput } from '@/lib/tarot/rules/build-context';
import type { ExtractedKnowledgeNode } from '@/lib/tarot/knowledge/types';
import {
  buildDailyFortunePrompt,
  buildLiteralTranslatePrompt,
  buildSingleFullPrompt,
  buildSingleGuidancePrompt,
  buildSingleVerdictPrompt,
  buildSpreadBriefPrompt,
  buildSpreadFullPrompt,
} from './prompts';

// ─── Fallbacks（规则层模板，不经 LLM）────────────────────────

function fallbackFromNodes(
  nodes: ExtractedKnowledgeNode[],
  question: string,
  synthesisPrefix?: string,
) {
  const cards = nodes.map((n) => {
    const pos = n.positionLabel ? `在${n.positionLabel}` : '';
    const flow = n.orientation === '正位' ? '顺畅流动' : '需要调整的角度';
    return {
      interpretation: `「${n.cardName}」${pos}${n.orientation}，${n.scenario.replace(/。$/, '')}，当下能量${flow}。`,
      mantra: n.orientation === '正位' ? '顺势而行，不必强求。' : '换个角度，答案往往就在转身处。',
    };
  });
  const names = nodes.map((n) => n.cardName).join('、');
  const synthesis =
    synthesisPrefix ??
    (nodes.length >= 3
      ? `围绕「${question}」，三牌「${names}」串联过去、现在与未来，请把每张牌的提示放进你的真实处境。`
      : `围绕「${question}」，「${names}」为当下给出指引，请结合主题「${nodes[0]?.topic ?? '整体'}」理解。`);
  return {
    cards,
    synthesis,
    suggestions: [
      '把牌面当作镜子，而不是判决书。',
      '接下来三天，做一件你一直拖着的小事。',
      '信任第一直觉给的方向。',
    ],
    affirmation: '我的平静比任何风暴都更有力量。',
    llm: false,
  };
}

// ─── Destiny slice guidance (行动指引) ───────────────────────

const guidanceSchema = z.object({
  action: z.string().min(1),
  insight: z.string().min(1),
});

function fallbackGuidanceFromNodes(nodes: ExtractedKnowledgeNode[], question: string) {
  const node = nodes[0];
  if (!node) {
    return {
      action: '先停下来，把两个选项各写下来，对比你真正害怕失去的是什么。',
      insight: '牌面信息暂不可用，但犹豫本身说明你在认真对待这个选择。',
      llm: false,
    };
  }
  const advice = node.advice[0] ?? '给自己一点空间，不必今天就做决定。';
  return {
    action: advice,
    insight: `围绕「${question}」，「${node.cardName}」${node.orientation}提示：${node.scenario.replace(/。$/, '')}`,
    llm: false,
  };
}

export async function generateDestinySliceGuidanceFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'single' });
  const fallback = fallbackGuidanceFromNodes(ctx.nodes, ctx.question);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: buildSingleGuidancePrompt(ctx),
    maxTokens: 700,
    temperature: 0.75,
    timeoutMs: 24000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = guidanceSchema.safeParse(parsed);
  if (!validated.success) return fallback;

  return {
    action: sanitizeTarotReaderText(validated.data.action),
    insight: sanitizeTarotReaderText(validated.data.insight),
    llm: true,
  };
}

// ─── Single-card verdict (是/否启示, legacy) ─────────────────

const verdictSchema = z.object({
  verdict: z.enum(['yes', 'no', 'lean_yes', 'lean_no', 'unclear']),
  headline: z.string().min(1),
  explanation: z.string().min(1),
  guidance: z.string().min(1),
});

function fallbackVerdictFromNodes(nodes: ExtractedKnowledgeNode[], question: string) {
  const node = nodes[0];
  if (!node) {
    return {
      verdict: 'unclear' as const,
      headline: '此刻不宜强行下定论',
      explanation: '牌面信息暂不可用，请稍后再试或换一种方式提问。',
      guidance: '把问题写得更具体一些，再抽一次看看。',
      llm: false,
    };
  }
  const positive = node.orientation === '正位';
  const verdict = positive ? ('lean_yes' as const) : ('lean_no' as const);
  const headline = positive ? '倾向于「是」' : '倾向于「否」';
  return {
    verdict,
    headline,
    explanation: `围绕「${question}」，「${node.cardName}」${node.orientation}指向${node.scenario.replace(/。$/, '')}。${node.meaning}`,
    guidance: node.advice[0] ?? '信任第一直觉，同时留一点余地观察变化。',
    llm: false,
  };
}

export async function generateSingleCardVerdictFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'single' });
  const fallback = fallbackVerdictFromNodes(ctx.nodes, ctx.question);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: buildSingleVerdictPrompt(ctx),
    maxTokens: 900,
    temperature: 0.75,
    timeoutMs: 26000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = verdictSchema.safeParse(parsed);
  if (!validated.success) return fallback;

  return {
    verdict: validated.data.verdict,
    headline: sanitizeTarotReaderText(validated.data.headline),
    explanation: sanitizeTarotReaderText(validated.data.explanation),
    guidance: sanitizeTarotReaderText(validated.data.guidance),
    llm: true,
  };
}

// ─── Single-card full ─────────────────────────────────────────

const fullSchema = z.object({
  cards: z.array(z.object({ interpretation: z.string().min(1), mantra: z.string().min(1) })).min(1),
  synthesis: z.string().min(1),
  suggestions: z.array(z.string().min(1)).min(1).max(5),
  affirmation: z.string().min(1),
});

export async function generateSingleCardFullFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'single' });
  const fallback = fallbackFromNodes(ctx.nodes, ctx.question);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: buildSingleFullPrompt(ctx),
    maxTokens: 1400,
    temperature: 0.8,
    timeoutMs: 28000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = fullSchema.safeParse(parsed);
  if (!validated.success) return fallback;
  return sanitizeTarotFullReport({ ...validated.data, llm: true });
}

// ─── Spread full (three-card / generic) ───────────────────────

export async function generateSpreadFullFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext(input);
  const fallback = fallbackFromNodes(ctx.nodes, ctx.question);

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: buildSpreadFullPrompt(ctx),
    maxTokens: 1800,
    temperature: 0.8,
    timeoutMs: 28000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = fullSchema.safeParse(parsed);
  if (!validated.success || validated.data.cards.length !== ctx.nodes.length) return fallback;
  return { ...validated.data, llm: true };
}

// ─── Spread brief ─────────────────────────────────────────────

const briefSchema = z.object({
  perCard: z.array(z.object({ position: z.string().min(1), text: z.string().min(1) })).min(1),
  synthesis: z.string().min(1),
});

export async function generateSpreadBriefFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext(input);
  const fallback = {
    perCard: ctx.nodes.map((n) => ({
      position: n.positionLabel ?? n.cardName,
      text: n.scenario.slice(0, 70),
    })),
    synthesis: `围绕「${ctx.question}」，牌面提示${ctx.topicLabel}议题值得持续关注。`,
    llm: false,
  };

  if (!isLlmConfigured() || ctx.nodes.length === 0) return fallback;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: buildSpreadBriefPrompt(ctx),
    maxTokens: 900,
    temperature: 0.8,
    timeoutMs: 24000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = briefSchema.safeParse(parsed);
  if (!validated.success || validated.data.perCard.length !== ctx.nodes.length) return fallback;
  return { ...validated.data, llm: true };
}

// ─── Daily fortune ────────────────────────────────────────────

const dailySchema = z.object({
  brief: z.string().min(1),
  full: z.object({
    work: z.object({ tag: z.string().min(1), text: z.string().min(1) }),
    love: z.object({ tag: z.string().min(1), text: z.string().min(1) }),
    career: z.object({ tag: z.string().min(1), text: z.string().min(1) }),
    wealth: z.object({ tag: z.string().min(1), text: z.string().min(1) }),
    summary: z.string().min(1),
  }),
});

export async function generateDailyFortuneFromLayers(input: ReadingContextInput) {
  const ctx = buildReadingContext({ ...input, spreadType: 'daily' });
  const node = ctx.nodes[0];
  const mk = (tag: string, text: string) => ({ tag, text });
  const fallback = {
    brief: node
      ? `今日主牌「${node.cardName}」（${node.orientation}）指向${ctx.topicLabel}。${node.scenario}`
      : '今日运势暂不可用。',
    full: {
      work: mk('平稳', node ? `工作方面，${node.advice[0]}` : '保持耐心。'),
      love: mk('温和', node ? `感情方面，留意${node.keywords[0] ?? '内心'}带来的信号。` : '真诚表达。'),
      career: mk('蓄势', node ? `事业层面，${node.advice[1] ?? node.scenario}` : '整理优先级。'),
      wealth: mk('谨慎', '财运上宜守不宜攻，小额试探可以。'),
      summary: node?.meaning ?? '',
    },
    llm: false,
  };

  if (!isLlmConfigured() || !node) return fallback;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: buildDailyFortunePrompt(ctx),
    maxTokens: 1400,
    temperature: 0.8,
    timeoutMs: 28000,
  });
  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = dailySchema.safeParse(parsed);
  if (!validated.success) return fallback;
  return { ...validated.data, llm: true };
}

// ─── Literal meaning（第一层直出 / 第三层仅翻译）──────────────

export async function generateLiteralMeaningFromLayers(input: {
  cardId: number;
  cardName: string;
  cardNameEn: string;
  orientation: '正位' | '逆位';
  language?: ReadingContextInput['language'];
}) {
  const { cardId, cardName, cardNameEn, orientation, language = 'zh-CN' } = input;
  const meaning = getLiteralMeaning(cardId, orientation);
  if (!meaning) return { text: '牌面释义暂不可用。', literal: true as const, llm: false };

  if (language === 'zh-CN' || language === 'zh-TW') {
    return { text: sanitizeTarotReaderText(meaning), literal: true as const, llm: false };
  }

  if (!isLlmConfigured()) {
    return { text: sanitizeTarotReaderText(meaning), literal: true as const, llm: false };
  }

  const raw = await chatCompletion({
    system: '你是塔罗牌义译者。只翻译给定牌义，不扩写、不个性化。',
    user: buildLiteralTranslatePrompt(meaning, cardName, cardNameEn, orientation, language),
    maxTokens: 400,
    temperature: 0.2,
    timeoutMs: 15000,
  });
  if (!raw) return { text: sanitizeTarotReaderText(meaning), literal: true as const, llm: false };
  return { text: sanitizeTarotReaderText(raw), literal: true as const, llm: true };
}

export { buildReadingContext };
