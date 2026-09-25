import { invokeLLM } from './_core/llm.ts';
import { buildSingleBaziPrompt, buildDoubleBaziPrompt, parseSections } from './prompts.ts';
import { sanitizeReportBrandText } from '../shared/report-brand.ts';
import { sanitizeVernacularText } from '../shared/vernacular-sanitize.ts';
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
        content: langGuide + '你是八字结构顾问 OraSage。正文必须现象→机制→句尾「体系里叫」。身弱只写偏耗。禁止医疗、财务、法律建议，禁止有救、开运、神煞、疾病、投资失利。当前年份是 2026 年，年份写成「2026 年（丙午）」。',
      },
      { role: 'user', content: prompt },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('LLM 返回内容为空');
  const content = sanitizeVernacularText(sanitizeReportBrandText(
    typeof rawContent === 'string'
      ? rawContent
      : (rawContent as Array<{ type: string; text?: string }>).map((c) => c.text ?? '').join(''),
  ));

  return { report: content, sections: parseSections(content) };
}
