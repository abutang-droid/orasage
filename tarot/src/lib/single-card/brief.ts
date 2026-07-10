import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { TAROT_READER_SYSTEM } from '@/lib/llm/prompts';
import { aiPromptLanguageLine, type AiLocale } from '../../../../shared/ai-locale/index';
import type { SingleCardBriefPayload, SingleCardStoredCard } from './types';

const briefSchema = z.object({
  text: z.string().min(1),
});

function templateBrief(card: SingleCardStoredCard, question: string): SingleCardBriefPayload {
  const hint =
    card.orientation === '正位'
      ? `正位能量顺畅，${card.element}元素在此发挥作用。`
      : `逆位提醒你换个角度看待，${card.element}元素需要调整。`;
  const q = question.trim();
  const text = q
    ? `「${card.cardName}」回应你的问题「${q.slice(0, 40)}」——${hint}简读到此，完整详读可解锁更深解读。`
    : `「${card.cardName}」为你带来当下指引——${hint}简读到此，完整详读可解锁更深解读。`;
  return { text, llm: false };
}

export async function generateSingleCardBrief(input: {
  question: string;
  card: SingleCardStoredCard;
  language?: AiLocale;
}): Promise<SingleCardBriefPayload> {
  const { question, card, language = 'zh-CN' } = input;
  const fallback = templateBrief(card, question);

  if (!isLlmConfigured()) {
    return fallback;
  }

  const userPrompt = `${aiPromptLanguageLine(language)}
用户问题：${question || '一般性指引'}

牌面：${card.cardName}（${card.orientation}）· 元素${card.element}

请生成单牌阵「免费简读」JSON（简短，不剧透完整详读内容）：
{
  "text": "单牌简读 80-120字，点到为止，结尾暗示完整报告有更多细节"
}`;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: userPrompt,
    maxTokens: 500,
    temperature: 0.8,
    timeoutMs: 20000,
  });

  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = briefSchema.safeParse(parsed);
  if (!validated.success) {
    return fallback;
  }

  return { text: validated.data.text, llm: true };
}
