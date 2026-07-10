import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { TAROT_READER_SYSTEM } from '@/lib/llm/prompts';
import { aiPromptLanguageLine, type AiLocale } from '../../../../shared/ai-locale/index';
import { sanitizeTarotReaderText } from '@/lib/llm/sanitize-output';
import type { SingleCardQuestion } from './types';

const questionSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        options: z.array(z.string().min(1)).min(2).max(5),
      }),
    )
    .length(2),
});

function templateQuestions(question: string, nickname?: string | null): SingleCardQuestion[] {
  const name = nickname && nickname !== '旅人' ? nickname : '你';
  const topic = question.trim() || '当下的心事';
  return [
    {
      id: 'focus',
      text: `${name}，关于「${topic.slice(0, 40)}」，你现在最想弄清的是？`,
      options: ['事情的走向', '我该怎么选', '对方的心意', '时机是否成熟', '我内心的阻碍'],
    },
    {
      id: 'feeling',
      text: '此刻你的感受更接近哪一种？',
      options: ['焦虑不安', '迷茫困惑', '满怀期待', '平静踏实', '压抑委屈'],
    },
  ];
}

export async function generateSingleCardQuestions(input: {
  question: string;
  nickname?: string | null;
  gender?: string | null;
  occupation?: string | null;
  faith?: string | null;
  language?: AiLocale;
}): Promise<{ questions: SingleCardQuestion[]; llm: boolean }> {
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

为单牌阵抽牌前的引导问答生成恰好 2 个问题，帮助缩小问题范围。
要求：
- 两个问题都围绕用户所问之事，语气亲切像朋友聊天
- 每个问题 2-5 个选项
- 不要出现「AI」「人工智能」「语言模型」等词
- 返回 JSON：{ "questions": [{ "id": "q1", "text": "...", "options": ["...", "..."] }] }`;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: userPrompt,
    maxTokens: 700,
    temperature: 0.85,
    timeoutMs: 22000,
  });

  if (!raw) return { questions: fallback, llm: false };

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = questionSchema.safeParse(parsed);
  if (!validated.success) return { questions: fallback, llm: false };

  const questions = validated.data.questions.map((q) => ({
    ...q,
    text: sanitizeTarotReaderText(q.text),
    options: q.options.map((o) => sanitizeTarotReaderText(o)),
  }));

  return { questions, llm: true };
}
