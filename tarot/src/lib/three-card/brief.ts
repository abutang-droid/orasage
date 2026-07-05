import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { TAROT_READER_SYSTEM } from '@/lib/llm/prompts';
import type { ThreeCardAnswer, ThreeCardBriefPayload, ThreeCardStoredCard } from './types';

const briefSchema = z.object({
  perCard: z
    .array(
      z.object({
        position: z.string().min(1),
        text: z.string().min(1),
      }),
    )
    .min(1)
    .max(5),
  synthesis: z.string().min(1),
});

function templateBrief(
  cards: ThreeCardStoredCard[],
  question: string,
): ThreeCardBriefPayload {
  const perCard = cards.map((c) => {
    const hint =
      c.orientation === '正位'
        ? `正位能量顺畅，${c.element}元素在此位发挥作用。`
        : `逆位提醒你换个角度看待，${c.element}元素需要调整。`;
    return {
      position: c.positionLabel,
      text: `「${c.cardName}」在${c.positionLabel}——${hint}`,
    };
  });

  const names = cards.map((c) => c.cardName).join('、');
  const synthesis = question.trim()
    ? `三牌「${names}」为你的问题「${question.slice(0, 30)}」勾勒出一条脉络：过去沉淀经验，现在呈现关键，未来展开可能。简读到此，完整详读可解锁更深解读。`
    : `三牌「${names}」串联起过去、现在与未来。每张牌都在诉说一个故事片段，合在一起指向你此刻最需要看见的方向。`;

  return { perCard, synthesis, llm: false };
}

export async function generateThreeCardBrief(input: {
  question: string;
  cards: ThreeCardStoredCard[];
  answers: ThreeCardAnswer[];
}): Promise<ThreeCardBriefPayload> {
  const { question, cards, answers } = input;
  const fallback = templateBrief(cards, question);

  if (!isLlmConfigured() || cards.length === 0) {
    return fallback;
  }

  const cardLines = cards
    .map((c) => `- ${c.positionLabel}：${c.cardName}（${c.orientation}）· 元素${c.element}`)
    .join('\n');
  const answerLines = answers.map((a) => `- ${a.question} → ${a.answer}`).join('\n');

  const userPrompt = `用户问题：${question || '一般性指引'}
抽牌前问答：
${answerLines || '（无）'}

牌面：
${cardLines}

请生成三牌阵「免费简读」JSON（简短，不剧透完整详读内容）：
{
  "perCard": [
    { "position": "过去/现在/未来", "text": "单牌简读 40-70字，点到为止" }
  ],
  "synthesis": "三牌综合简读 80-120字，概括脉络，结尾暗示完整报告有更多细节"
}

perCard 数组长度必须等于 ${cards.length}。`;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: userPrompt,
    maxTokens: 900,
    temperature: 0.8,
    timeoutMs: 24000,
  });

  if (!raw) return fallback;

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = briefSchema.safeParse(parsed);
  if (!validated.success || validated.data.perCard.length !== cards.length) {
    return fallback;
  }

  return { ...validated.data, llm: true };
}
