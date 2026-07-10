import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { TAROT_READER_SYSTEM } from '@/lib/llm/prompts';
import { aiPromptLanguageLine, type AiLocale } from '../../../../shared/ai-locale/index';
import type { TarotCardData } from '@/lib/tarot/cards';
import type { DailyFortuneAnswer, DailyFortuneReportPayload } from './types';

const dimSchema = z.object({
  tag: z.string().min(1),
  text: z.string().min(1),
});

const reportSchema = z.object({
  brief: z.string().min(1),
  full: z.object({
    work: dimSchema,
    love: dimSchema,
    career: dimSchema,
    wealth: dimSchema,
    summary: z.string().min(1),
  }),
});

function templateReport(
  card: TarotCardData,
  orientation: '正位' | '逆位',
  answers: DailyFortuneAnswer[],
): DailyFortuneReportPayload {
  const meaning = orientation === '正位' ? card.meaningUp : card.meaningDown;
  const focus = answers.find((a) => a.questionId === 'focus')?.answer ?? '整体状态';
  const brief = `今日主牌「${card.name}」（${orientation}）指向${focus}。${meaning.slice(0, 60)}…`;

  const mk = (tag: string, text: string) => ({ tag, text });
  return {
    brief,
    full: {
      work: mk('平稳', `工作方面，${card.name}提醒你在节奏上保持耐心，先把眼前一件小事做好。`),
      love: mk('温和', `感情方面，不必急着要答案。${orientation === '正位' ? '真诚表达会比猜测更有效。' : '先照顾好自己的情绪边界。'}`),
      career: mk('蓄势', `事业层面，适合整理优先级，把精力放在最能产生积累的方向。`),
      wealth: mk('谨慎', `财运上宜守不宜攻，小额试探可以，大额决策建议多等一天。`),
      summary: meaning,
    },
    llm: false,
  };
}

export async function generateDailyFortuneReport(input: {
  card: TarotCardData;
  orientation: '正位' | '逆位';
  answers: DailyFortuneAnswer[];
  nickname?: string | null;
  language?: AiLocale;
}): Promise<DailyFortuneReportPayload> {
  const { card, orientation, answers, nickname, language = 'zh-CN' } = input;
  const fallback = templateReport(card, orientation, answers);

  if (!isLlmConfigured()) return fallback;

  const answerLines = answers.map((a) => `- ${a.question} → ${a.answer}`).join('\n');
  const userPrompt = `${aiPromptLanguageLine(language)}
用户：${nickname || '旅人'}
今日主牌：${card.name}（${orientation}）· 元素${card.element}
牌意参考：${orientation === '正位' ? card.meaningUp : card.meaningDown}

抽牌前问答：
${answerLines}

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

  return { ...validated.data, llm: true };
}
