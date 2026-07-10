import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { TAROT_READER_SYSTEM } from '@/lib/llm/prompts';
import { aiPromptLanguageLine, type AiLocale } from '../../../shared/ai-locale/index';

export type ReadingCardInput = {
  position: string;
  positionLabel: string;
  cardName: string;
  cardNameEn?: string;
  cardId: number;
  orientation: '正位' | '逆位';
  element: string;
};

export type ReadingInterpretResult = {
  cards: Array<{ interpretation: string; mantra: string }>;
  synthesis: string;
  suggestions: string[];
  affirmation: string;
  llm: boolean;
};

const llmSchema = z.object({
  cards: z.array(
    z.object({
      interpretation: z.string().min(1),
      mantra: z.string().min(1),
    }),
  ),
  synthesis: z.string().min(1),
  suggestions: z.array(z.string()).min(1).max(5),
  affirmation: z.string().min(1),
});

function templateFallback(
  cards: ReadingCardInput[],
  _spreadType: string,
  question: string,
): ReadingInterpretResult {
  const elemMap: Record<string, string> = { 火: '行动与激情', 水: '情感与直觉', 风: '思维与沟通', 土: '稳固与现实' };

  const interpretedCards = cards.map((c) => {
    const posWord =
      c.position === 'past' ? '过去位' : c.position === 'present' ? '现在位' : c.position === 'future' ? '未来位' : '此刻';
    const elemWord = elemMap[c.element] || '命运的流转';
    const interpretation =
      c.orientation === '正位'
        ? `${c.cardName}在${posWord}——正位的力量正在顺畅地流动。这张牌暗示着${elemWord}正在主导这个阶段。`
        : `${c.cardName}的逆位出现在${posWord}。逆位不是坏消息——它提醒你有些能量正在被压抑，${elemWord}需要换个角度释放。`;
    return {
      interpretation,
      mantra: c.orientation === '正位' ? '顺势而行，不必强求。' : '有时候后退一步，是为了看清全貌。',
    };
  });

  const c0 = cards[0];
  const c1 = cards[1] ?? c0;
  const c2 = cards[2] ?? c0;
  const synthesis =
    cards.length >= 3
      ? `${c0.cardName}在${c0.orientation === '正位' ? '顺流' : '提醒'}中指向你的过往。${c1.cardName}代表此刻的能量。${c2.cardName}展开了未来的可能。`
      : `${c0.cardName}（${c0.orientation}）为「${question || '今日整体运势'}」给出当下指引。`;

  return {
    cards: interpretedCards,
    synthesis,
    suggestions: [
      '把过去的经验当成指南，而非包袱。',
      '接下来三天，做一件你一直拖着的小事。',
      '信任第一直觉给的方向。',
    ],
    affirmation: '我的平静比任何风暴都更有力量。',
    llm: false,
  };
}

export async function interpretReadingWithLlm(input: {
  question: string;
  spreadType: string;
  cards: ReadingCardInput[];
  language?: AiLocale;
}): Promise<ReadingInterpretResult> {
  const { question, spreadType, cards, language = 'zh-CN' } = input;

  if (!isLlmConfigured() || cards.length === 0) {
    return templateFallback(cards, spreadType, question);
  }

  const cardLines = cards
    .map(
      (c, i) =>
        `${i + 1}. ${c.positionLabel}（${c.position}）— ${c.cardName} / ${c.cardNameEn ?? c.cardName} · ${c.orientation} · 元素${c.element}`,
    )
    .join('\n');

  const userPrompt = `用户问题：${question || '今日整体运势'}
牌阵：${spreadType}
${aiPromptLanguageLine(language)}

牌面：
${cardLines}

请返回 JSON：
{
  "cards": [
    { "interpretation": "单牌解读 80-150字", "mantra": "一句箴言 12字内" }
  ],
  "synthesis": "三牌综合 200-350字",
  "suggestions": ["建议1 50-80字", "建议2", "建议3"],
  "affirmation": "肯定语 15-25字，第一人称"
}

cards 数组长度必须等于 ${cards.length}。`;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: userPrompt,
    maxTokens: 1800,
    temperature: 0.8,
    timeoutMs: 28000,
  });

  if (!raw) return templateFallback(cards, spreadType, question);

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = llmSchema.safeParse(parsed);
  if (!validated.success || validated.data.cards.length !== cards.length) {
    console.warn('[reading-interpret] LLM JSON invalid, using template');
    return templateFallback(cards, spreadType, question);
  }

  return { ...validated.data, llm: true };
}
