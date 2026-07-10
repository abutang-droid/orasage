import { z } from 'zod';
import { chatCompletion, isLlmConfigured, parseJsonFromLlm } from '@/lib/llm/client';
import { TAROT_READER_SYSTEM } from '@/lib/llm/prompts';
import { aiPromptLanguageLine, type AiLocale } from '../../../shared/ai-locale/index';
import type { DailyFortuneQuestion } from './types';

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

function templateQuestions(nickname?: string | null): DailyFortuneQuestion[] {
  const name = nickname && nickname !== '旅人' ? nickname : '你';
  return [
    {
      id: 'focus',
      text: `${name}，今天你最想看清哪个方向？`,
      options: ['工作节奏', '感情关系', '事业抉择', '财运机会', '整体状态'],
    },
    {
      id: 'energy',
      text: '此刻你的能量更接近哪一种？',
      options: ['疲惫想休息', '平稳踏实', '充满干劲', '有点焦虑', '迷茫不确定'],
    },
    {
      id: 'concern',
      text: '今天有没有一件特别放不下的事？',
      options: ['工作上的事', '感情上的事', '钱或资源', '健康或状态', '暂时没有'],
    },
    {
      id: 'wish',
      text: '你希望今天的运势给你什么提醒？',
      options: ['给我信心', '帮我避坑', '告诉我时机', '安抚我的情绪', '随便看看'],
    },
  ];
}

export async function generateDailyFortuneQuestions(input: {
  nickname?: string | null;
  gender?: string | null;
  occupation?: string | null;
  faith?: string | null;
  language?: AiLocale;
}): Promise<{ questions: DailyFortuneQuestion[]; llm: boolean }> {
  const { nickname, gender, occupation, faith, language = 'zh-CN' } = input;
  const fallback = templateQuestions(nickname);

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
为「每日运势」抽牌前的引导问答生成 3-5 个问题。
用户档案：
${profile || '（暂无）'}

要求：
- 每个问题 2-5 个选项，贴近今日运势场景（工作/爱情/事业/财运）
- 语气像 Manto 塔罗师在聊天，亲切不装神
- 返回 JSON：{ "questions": [{ "id": "q1", "text": "...", "options": ["...", "..."] }] }`;

  const raw = await chatCompletion({
    system: TAROT_READER_SYSTEM,
    user: userPrompt,
    maxTokens: 900,
    temperature: 0.85,
    timeoutMs: 20000,
  });

  if (!raw) return { questions: fallback, llm: false };

  const parsed = parseJsonFromLlm<unknown>(raw);
  const validated = questionSchema.safeParse(parsed);
  if (!validated.success) return { questions: fallback, llm: false };

  return { questions: validated.data.questions, llm: true };
}
