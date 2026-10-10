import { invokeLLM } from './_core/llm.ts';
import { buildSingleBaziPrompt, buildDoubleBaziPrompt, buildBriefBaziPrompt, parseSections } from './prompts.ts';
import { sanitizeReportBrandText } from '../shared/report-brand.ts';
import { sanitizeVernacularText } from '../shared/vernacular-sanitize.ts';
import { aiSystemLanguagePrefix } from '../../shared/ai-locale/index.ts';
import { localChartFromResult, parseCalibratedChart, type CalibratedChart } from './chartCalibrate.ts';

export async function generateBaziReportContent(
  type: 'single' | 'couple',
  resultData: Record<string, unknown>,
  lang: 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR' = 'zh-CN',
  kind: 'brief' | 'full' = 'full',
): Promise<{ report: string; sections: ReturnType<typeof parseSections>; chart: CalibratedChart }> {
  const prompt = kind === 'brief'
    ? buildBriefBaziPrompt(resultData, lang, type)
    : type === 'single'
      ? buildSingleBaziPrompt(resultData, lang)
      : buildDoubleBaziPrompt(resultData, lang);

  const langGuide = aiSystemLanguagePrefix(lang);
  const localChart = localChartFromResult(resultData);
  const briefJsonRule = kind === 'brief'
    ? '简版必须只返回 JSON：year/month/day/hour（干支）、wuXing（木火土金水）、riZhu、note。四柱与五行以你校准后的结果为输出标准；本地无误则原样返回。'
    : '';

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: langGuide + '你是八字结构顾问 OraSage。正文必须现象→机制→句尾「体系里叫」。身弱只写偏耗。禁止医疗、财务、法律建议，禁止有救、开运、神煞、疾病、投资失利。当前年份是 2026 年，年份写成「2026 年（丙午）」。' + briefJsonRule,
      },
      { role: 'user', content: prompt },
    ],
  });

  const rawContent = response.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('LLM 返回内容为空');
  const rawText = typeof rawContent === 'string'
    ? rawContent
    : (rawContent as Array<{ type: string; text?: string }>).map((c) => c.text ?? '').join('');
  const parsed = kind === 'brief'
    ? parseCalibratedChart(rawText, localChart)
    : { note: rawText, chart: localChart };
  const content = sanitizeVernacularText(sanitizeReportBrandText(
    parsed.note || (kind === "brief" ? "" : rawText),
  ));

  return { report: content, sections: parseSections(content), chart: parsed.chart };
}
