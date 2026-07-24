import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { tarotReaderSystem } from '@/lib/llm/prompts';
import { aiPromptLanguageLine, type AiLocale } from '../../../../shared/ai-locale/index';
import type { ThreeCardQuestion } from './types';

const questionSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        options: z.array(z.string().min(1)).min(2).max(6),
      }),
    )
    .min(3)
    .max(6),
});

function templateQuestions(question: string, nickname?: string | null): ThreeCardQuestion[] {
  const name = nickname && nickname !== '旅人' ? nickname : '你';
  const topic = question.trim() || '当下的心事';
  return [
    {
      id: 'intent',
      text: `${name}，关于「${topic.slice(0, 40)}」，你现在最想弄清什么？`,
      options: ['事情的走向', '我该怎么选', '对方的心意', '时机是否成熟', '我内心的阻碍'],
    },
    {
      id: 'feeling',
      text: '此刻你的感受更接近哪一种？',
      options: ['焦虑不安', '迷茫困惑', '满怀期待', '平静踏实', '压抑委屈'],
    },
    {
      id: 'timeline',
      text: '这件事在你心里已经多久了？',
      options: ['刚刚发生', '这几天', '几周了', '好几个月', '一直萦绕'],
    },
    {
      id: 'readiness',
      text: '你准备好听到怎样的答案？',
      options: ['给我方向', '帮我看清真相', '安抚我的情绪', '告诉我该行动还是等待', '都可以'],
    },
  ];
}

export async function generateThreeCardQuestions(input: {
  question: string;
  nickname?: string | null;
  gender?: string | null;
  occupation?: string | null;
  faith?: string | null;
  language?: AiLocale;
}): Promise<{ questions: ThreeCardQuestion[]; llm: boolean }> {
  const { question, nickname, gender, occupation, faith, language = 'zh-CN' } = input;
  const fallback = templateQuestions(question, nickname);

  if (!isLlmConfigured()) {
    return { questions: fallback, llm: false };
  }

  const profile = [
    nickname ? `昵称：${nickname}` : null,
    gender ? `性别：${gender}` : null,
    occupation ? `工作状态：${occupation}` : null,
    faith ? `信仰：${faith}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const userPrompt = `${aiPromptLanguageLine(language)}
用户想占卜的问题：${question || '（未填写，做一般性指引）'}
用户档案：
${profile || '（暂无）'}

为三牌阵（过去·现在·未来）抽牌前的引导问答生成 3-6 个问题。
要求：
- 问题要围绕用户所问之事，帮助 Manto 理解背景与心境
- 每个问题 2-5 个选项，语气亲切像聊天
- 返回 JSON：{ "questions": [{ "id": "q1", "text": "...", "options": ["...", "..."] }] }`;

  const raw = await chatCompletion({
    system: tarotReaderSystem(language),
    user: userPrompt,
    maxTokens: 1000,
    temperature: 0.85,
    timeoutMs: 22000,
  });

  if (!raw) return { questions: fallback, llm: false };

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = questionSchema.safeParse(parsed);
  if (!validated.success) return { questions: fallback, llm: false };

  return { questions: validated.data.questions, llm: true };
}
