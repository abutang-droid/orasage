import type { ZiweiChart } from '@/lib/ziwei/types';
import {
  aiLanguageReplyRule,
  aiSystemLanguagePrefix,
  type AiLocale,
} from '../../shared/ai-locale/index';

function reportSystem(locale: AiLocale): string {
  if (locale === 'en') {
    return `${aiSystemLanguagePrefix(locale)}You are a Zi Wei Dou Shu master with traditional Chinese metaphysics knowledge and a modern psychology lens.
Style: warm, professional, insightful; plain language; no absolute prophecies.
Output Markdown with ## section titles and **emphasis**.
Chart JSON may contain Chinese palace/star names — digest them and write the narrative in English only.
${aiLanguageReplyRule(locale)}`;
  }
  if (locale === 'pt-BR') {
    return `${aiSystemLanguagePrefix(locale)}Você é um mestre de Zi Wei Dou Shu com metafísica tradicional e olhar de psicologia moderna.
Estilo: caloroso, profissional, perspicaz; linguagem clara; sem profecias absolutas.
Saída em Markdown com ## títulos e **ênfase**.
O JSON do mapa pode ter nomes em chinês — digira e escreva a narrativa só em Português.
${aiLanguageReplyRule(locale)}`;
  }
  return `${aiSystemLanguagePrefix(locale)}你是一位精通紫微斗数的命理师，拥有深厚的东方传统命理学知识。
你的报告风格：温暖、专业、有洞察力；用现代语言诠释传统命理；结合心理学视角；客观中立，不做绝对化预言。
请输出 Markdown 格式，包含 ## 章节标题与 **重点** 标注。
${aiLanguageReplyRule(locale)}`;
}

function chartBrief(chart: ZiweiChart, locale: AiLocale): string {
  const ming = chart.palaces.find((p) => p.name === '命宫');
  const stars = ming?.stars?.map((s) => s.name).join(locale === 'zh-CN' || locale === 'zh-TW' ? '、' : ', ') ?? '—';
  const name = chart.birthInfo.name?.trim()
    || (locale === 'en' ? 'Native' : locale === 'pt-BR' ? 'Nativo' : '命主');
  const life = locale === 'en' ? 'Ming' : locale === 'pt-BR' ? 'Palácio da Vida' : '命宫';
  return `${name} · ${chart.wuxingJuName} · ${life} ${stars}`;
}

function buildSinglePrompt(chart: ZiweiChart, planType: string, locale: AiLocale): string {
  if (locale === 'en') {
    const depth = planType === 'basic'
      ? 'Write a concise deep reading (~800 words)'
      : planType === 'premium'
        ? 'Write a full ultimate report (~2000 words) with yearly outlook and remedies'
        : 'Write a full deep report (~1200 words) covering twelve palaces and crystal guidance';
    return `${depth} based on this Zi Wei chart JSON:

${JSON.stringify(chart, null, 2)}

Required sections:
## Chart overview
## Life palace & temperament
## Career & wealth
## Love & relationships
## Health & energy
## OraSage advice

${aiLanguageReplyRule(locale)}`;
  }
  if (locale === 'pt-BR') {
    const depth = planType === 'basic'
      ? 'Escreva uma leitura profunda e concisa (~800 palavras)'
      : planType === 'premium'
        ? 'Escreva um relatório completo (~2000 palavras) com previsão anual e remédios'
        : 'Escreva um relatório profundo (~1200 palavras) com doze palácios e orientação de cristal';
    return `${depth} com base neste JSON de mapa Zi Wei:

${JSON.stringify(chart, null, 2)}

Seções obrigatórias:
## Visão geral do mapa
## Palácio da Vida e temperamento
## Carreira e riqueza
## Amor e relações
## Saúde e energia
## Conselhos OraSage

${aiLanguageReplyRule(locale)}`;
  }

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
  if (locale === 'en') {
    const depth = planType === 'basic'
      ? 'Write a concise synastry reading (~900 words)'
      : planType === 'premium'
        ? 'Write a full dual ultimate synastry report (~2200 words)'
        : 'Write a full synastry report (~1400 words)';
    return `${depth} for these two Zi Wei charts:

A: ${chartBrief(chartA, locale)}
B: ${chartBrief(chartB, locale)}

Chart A: ${JSON.stringify(chartA, null, 2)}

Chart B: ${JSON.stringify(chartB, null, 2)}

Required sections:
## Synastry overview
## Personality complementarity
## Romantic bond
## Career collaboration
## Relationship advice
## Shared years ahead
## OraSage advice

${aiLanguageReplyRule(locale)}`;
  }
  if (locale === 'pt-BR') {
    const depth = planType === 'basic'
      ? 'Escreva uma leitura de synastry concisa (~900 palavras)'
      : planType === 'premium'
        ? 'Escreva um relatório dual completo (~2200 palavras)'
        : 'Escreva um relatório de synastry completo (~1400 palavras)';
    return `${depth} para estes dois mapas Zi Wei:

A: ${chartBrief(chartA, locale)}
B: ${chartBrief(chartB, locale)}

Mapa A: ${JSON.stringify(chartA, null, 2)}

Mapa B: ${JSON.stringify(chartB, null, 2)}

Seções obrigatórias:
## Visão geral da synastry
## Complementaridade de personalidade
## Vínculo romântico
## Colaboração profissional
## Conselhos de relacionamento
## Anos à frente
## Conselhos OraSage

${aiLanguageReplyRule(locale)}`;
  }

  const depth = planType === 'basic'
    ? '撰写一份精炼合盘解读（约 900 字）'
    : planType === 'premium'
      ? '撰写一份完整双人终极合盘报告（约 2200 字）'
      : '撰写一份完整合盘报告（约 1400 字）';

  return `${depth}，分析以下两人紫微命盘的缘分匹配：

甲方：${chartBrief(chartA, locale)}
乙方：${chartBrief(chartB, locale)}

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
