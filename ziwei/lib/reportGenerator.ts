import type { ZiweiChart } from '@/lib/ziwei/types';
import {
  aiLanguageReplyRule,
  aiSystemLanguagePrefix,
  type AiLocale,
} from '../../shared/ai-locale/index';

function reportSystem(locale: AiLocale): string {
  return `${aiSystemLanguagePrefix(locale)}你是一位精通紫微斗数的命理师，拥有深厚的东方传统命理学知识。
你的报告风格：温暖、专业、有洞察力；用现代语言诠释传统命理；结合心理学视角；客观中立，不做绝对化预言。
请输出 Markdown 格式，包含 ## 章节标题与 **重点** 标注。
${aiLanguageReplyRule(locale)}`;
}

function chartBrief(chart: ZiweiChart): string {
  const ming = chart.palaces.find((p) => p.name === '命宫');
  const stars = ming?.stars?.map((s) => s.name).join('、') ?? '—';
  const name = chart.birthInfo.name?.trim() || '命主';
  return `${name} · ${chart.wuxingJuName} · 命宫 ${stars}`;
}

function buildSinglePrompt(chart: ZiweiChart, planType: string, locale: AiLocale): string {
  const depth = planType === 'basic'
    ? '撰写一份精炼的深度解读（约 800 字）'
    : planType === 'premium'
      ? '撰写一份完整终极报告（约 2000 字），含流年运势与开运建议'
      : '撰写一份完整深度报告（约 1200 字），含十二宫要点与能量手串建议';

  return `${depth}，基于以下紫微命盘数据：

${JSON.stringify(chart, null, 2)}

报告须包含：
## 命盘总览
## 命宫与性格特质
## 事业财运
## 感情人际
## 健康能量
## OraSage 建议

${aiLanguageReplyRule(locale)}`;
}

function buildCouplePrompt(chartA: ZiweiChart, chartB: ZiweiChart, planType: string, locale: AiLocale): string {
  const depth = planType === 'basic'
    ? '撰写一份精炼合盘解读（约 900 字）'
    : planType === 'premium'
      ? '撰写一份完整双人终极合盘报告（约 2200 字）'
      : '撰写一份完整合盘报告（约 1400 字）';

  return `${depth}，分析以下两人紫微命盘的缘分匹配：

甲方：${chartBrief(chartA)}
乙方：${chartBrief(chartB)}

命盘数据：
甲方：${JSON.stringify(chartA, null, 2)}

乙方：${JSON.stringify(chartB, null, 2)}

报告须包含：
## 合盘总评
## 性格互补度
## 感情缘分
## 事业合作
## 相处建议
## 关键流年
## OraSage 建议

${aiLanguageReplyRule(locale)}`;
}

async function callLlm(userPrompt: string, locale: AiLocale): Promise<string> {
  const apiKey =
    process.env.MANUS_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.OPENAI_API_KEY;
  const baseUrl =
    process.env.MANUS_API_BASE ||
    (process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : 'https://api.openai.com/v1');
  const model =
    process.env.AI_MODEL ||
    (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

  if (!apiKey) throw new Error('AI API key not configured');

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: reportSystem(locale) },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') throw new Error('LLM 返回内容为空');
  return content;
}

export async function generateZiweiReportContent(
  type: 'single' | 'couple',
  payload: { chart?: ZiweiChart; chartA?: ZiweiChart; chartB?: ZiweiChart },
  planType = 'advanced',
  locale: AiLocale = 'zh-CN',
): Promise<string> {
  const prompt = type === 'couple'
    ? buildCouplePrompt(payload.chartA!, payload.chartB!, planType, locale)
    : buildSinglePrompt(payload.chart!, planType, locale);
  return callLlm(prompt, locale);
}
