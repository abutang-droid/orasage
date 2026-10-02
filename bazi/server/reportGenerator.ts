import { invokeLLM } from './_core/llm.ts';
import { buildSingleBaziPrompt, buildDoubleBaziPrompt, parseSections } from './prompts.ts';
import { sanitizeReportBrandText } from '../shared/report-brand.ts';
import { aiSystemLanguagePrefix } from '../../shared/ai-locale/index.ts';

export async function generateBaziReportContent(
  type: 'single' | 'couple',
  resultData: Record<string, unknown>,
  lang: 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR' = 'zh-CN',
) {
  const prompt = type === 'single'
    ? buildSingleBaziPrompt(resultData, lang)
    : buildDoubleBaziPrompt(resultData, lang);

  const langGuide = aiSystemLanguagePrefix(lang);

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: langGuide + '你是铁口直断派八字命理顾问 OraSage。必须严格按照《铁口直断》4 层过滤 + 裁决引擎（用户消息中的引擎裁决）写报告，不得另起炉灶改判喜忌/格局。每句结论注明 [OraSage：…]。当前年份是 2026 年。',
      },
      { role: 'user', content: prompt },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('LLM 返回内容为空');
  const content = sanitizeReportBrandText(
    typeof rawContent === 'string'
      ? rawContent
      : (rawContent as Array<{ type: string; text?: string }>).map((c) => c.text ?? '').join(''),
  );

  return { report: content, sections: parseSections(content) };
}
