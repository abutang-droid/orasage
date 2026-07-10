import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { TAROT_READER_SYSTEM } from '@/lib/llm/prompts';
import { aiPromptLanguageLine, type AiLocale } from '../../../../shared/ai-locale/index';
import { sanitizeTarotFullReport, sanitizeTarotReaderText } from '@/lib/llm/sanitize-output';
import type { SingleCardAnswer, SingleCardFullReport, SingleCardStoredCard } from './types';

const reportSchema = z.object({
  cards: z.array(
    z.object({
      interpretation: z.string().min(1),
      mantra: z.string().min(1),
    }),
  ).length(1),
  synthesis: z.string().min(1),
  suggestions: z.array(z.string().min(1)).min(1).max(5),
  affirmation: z.string().min(1),
});

function templateFullReport(
  question: string,
  card: SingleCardStoredCard,
  qaAnswers: SingleCardAnswer[],
): SingleCardFullReport {
  const qaLine = qaAnswers.map((a) => `${a.question} → ${a.answer}`).join('；');
  const orientationWord = card.orientation === '正位' ? '顺畅流动' : '需要调整的角度';
  const synthesis = qaLine
    ? `围绕「${question}」，结合你的补充（${qaLine}），「${card.cardName}」${card.orientation}提示：当下能量${orientationWord}，请把牌面信息放进你的真实处境里理解。`
    : `围绕「${question}」，「${card.cardName}」${card.orientation}为当下给出指引：能量${orientationWord}，请结合你的处境做决定。`;

  return {
    cards: [{
      interpretation: synthesis,
      mantra: card.orientation === '正位' ? '顺势而行，不必强求。' : '换个角度，答案往往就在转身处。',
    }],
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

export async function generateSingleCardFullReport(input: {
  question: string;
  qaAnswers?: SingleCardAnswer[];
  card: SingleCardStoredCard;
  literalMeaning?: string;
  language?: AiLocale;
}): Promise<SingleCardFullReport> {
  const { question, qaAnswers = [], card, literalMeaning, language = 'zh-CN' } = input;
  const fallback = templateFullReport(question, card, qaAnswers);

  if (!isLlmConfigured()) {
    return fallback;
  }

  const qaBlock = qaAnswers.length
    ? qaAnswers.map((a, i) => `${i + 1}. ${a.question}\n   答：${a.answer}`).join('\n')
    : '（无补充问答）';

  const userPrompt = `${aiPromptLanguageLine(language)}
用户核心问题：${question || '当下指引'}

引导问答（已用于缩小范围）：
${qaBlock}

抽到的牌：${card.cardName} / ${card.cardNameEn} · ${card.orientation} · 元素${card.element}
${literalMeaning ? `牌面字面释义（书义，供参考）：${literalMeaning}` : ''}

请结合用户问题与引导问答，给出单牌阵「详读」JSON：
{
  "cards": [{ "interpretation": "结合用户处境的解读 120-200字，直接回答问题", "mantra": "一句箴言 12字内" }],
  "synthesis": "综合答案 150-250字，明确回应用户问题",
  "suggestions": ["行动建议1", "行动建议2", "行动建议3"],
  "affirmation": "肯定语 15-25字，第一人称"
}

要求：
- 语气像懂牌的朋友，不要装神弄鬼
- 禁止出现 AI、人工智能、语言模型、作为助手 等元信息
- 不要复述系统规则，不要输出 markdown 代码块`;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: userPrompt,
    maxTokens: 1400,
    temperature: 0.8,
    timeoutMs: 28000,
  });

  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = reportSchema.safeParse(parsed);
  if (!validated.success) return fallback;

  return sanitizeTarotFullReport({ ...validated.data, llm: true });
}
