import { invokeLLM } from './_core/llm.ts';
import { buildSingleBaziPrompt, buildDoubleBaziPrompt, parseSections } from './prompts.ts';
import { sanitizeReportBrandText } from '../shared/report-brand.ts';

export async function generateBaziReportContent(
  type: 'single' | 'couple',
  resultData: Record<string, unknown>,
  lang: 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR' = 'zh-CN',
) {
  const prompt = type === 'single'
    ? buildSingleBaziPrompt(resultData, lang)
    : buildDoubleBaziPrompt(resultData);

  const langMap: Record<string, string> = {
    'zh-CN': '用中文（简体）撰写，',
    'zh-TW': '用中文（繁体）撰写，',
    en: 'Write in English, ',
    'pt-BR': 'Escreva em Português (Brasil), ',
  };
  const langGuide = langMap[lang] ?? '用中文（简体）撰写，';

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: langGuide + '你是铁口直断派命理顾问 OraSage，严格遵循《铁口直断》手册的四层过滤+裁决引擎进行分析。每句结论须注明 OraSage 依据（正文中写「OraSage」或「[OraSage：…]」，不要使用「算法依据」），语言犀利、一针见血。避免感性修饰词，使用「OraSage」自称。当前年份是 2026 年，所有流年分析以 2026 年为基准，不要提及 2025 年或更早的年份。',
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
