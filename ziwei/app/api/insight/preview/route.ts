import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import type { ZiweiChart } from '@/lib/ziwei/types';
import {
  adultPreviewSystem,
  minorPreviewSystem,
} from '@/lib/ai-prompts';
import { resolveAiLocaleFromRequest, type AiLocale } from '../../../../../shared/ai-locale/index';

export const runtime = 'nodejs';

function ruleBasedPreview(chart: ZiweiChart, minorMode: boolean, locale: AiLocale): string {
  const ming = chart.palaces.find((p) => p.name === '命宫');
  const majorZh = ming?.stars.filter((s) => s.type === 'major').map((s) => s.name).join('、') || '空宫借星';
  const majorEn = ming?.stars.filter((s) => s.type === 'major').map((s) => s.name).join(', ') || 'borrowed stars';
  const name = chart.birthInfo.name?.trim() || (locale === 'en' ? 'Native' : locale === 'pt-BR' ? 'Nativo' : '命主');
  const dx = chart.daXians[chart.currentDaXianIndex];
  const dxPalace = dx
    ? (chart.palaces.find((p) => p.branch === dx.palaceBranch)?.name ?? '—')
    : null;

  if (locale === 'en') {
    if (minorMode) {
      return `[${name}] ${chart.wuxingJuName} chart

Ming palace majors: ${majorEn}

A youth-safe brief: temperament and study habits stand out; keep regular sleep and light exercise. Grow strengths step by step, and explore future directions from interests — with a parent or mentor nearby.

Sign in to ask Orasage (5 free chats per chart). Topics stay within health, study, and future direction.`;
    }
    return `[${name}] ${chart.wuxingJuName} chart

Ming palace majors: ${majorEn}

The Life palace anchors temperament and life rhythm with Wealth, Career, and Travel. Current decade limit${dx ? ` sits in ${dxPalace}, ages ${dx.startAge}–${dx.endAge}` : ' is pending'} — clarify your energy pattern before pushing hard.

Sign in to ask Orasage for chart-specific guidance (5 free chats per chart).`;
  }

  if (locale === 'pt-BR') {
    if (minorMode) {
      return `[${name}] mapa ${chart.wuxingJuName}

Estrelas principais do Palácio da Vida: ${majorEn}

Leitura breve para jovens: temperamento e hábitos de estudo se destacam; mantenha sono regular e exercício leve. Cresça por etapas e explore o futuro a partir dos interesses — com um adulto por perto.

Entre para perguntar ao Orasage (5 chats grátis por mapa). Temas: saúde, estudos e direção futura.`;
    }
    return `[${name}] mapa ${chart.wuxingJuName}

Estrelas principais do Palácio da Vida: ${majorEn}

O Palácio da Vida ancora temperamento e ritmo, junto com Riqueza, Carreira e Viagem. O limite decenal atual${dx ? ` está em ${dxPalace}, idades ${dx.startAge}–${dx.endAge}` : ' ainda não começou'} — esclareça seu padrão de energia antes de forçar.

Entre para perguntar ao Orasage (5 chats grátis por mapa).`;
  }

  if (minorMode) {
    return `【${name}】${chart.wuxingJuName}命盘

命宫主星：${majorZh}

这是一份面向青少年的基础命格简读。从命盘可见性格底色与学习习惯方面的特点，健康上宜保持规律作息与适度运动。学业可发挥命宫主星优势，循序渐进。未来方向宜从兴趣与特长出发探索，家长可陪伴引导。

登录后可向 Orasage 提问（每份排盘赠送 5 次免费对话），内容将限定在健康、学业与未来方向。`;
  }

  return `【${name}】${chart.wuxingJuName}命盘

命宫主星：${majorZh}

命盘以命宫为核心，三方四正联动财帛、官禄、迁移诸宫，勾勒性格底色与人生节奏。当前大限${dx ? `在${dxPalace ?? '—'}，${dx.startAge}–${dx.endAge}岁` : '待起'}，宜先认清自身能量模式，再顺势而为。

登录后可向 Orasage 提问，获取针对你命盘的具体解读（每份排盘赠送 5 次免费对话）。`;
}

async function llmPreview(chart: ZiweiChart, minorMode: boolean, locale: AiLocale): Promise<string | null> {
  const apiKey =
    process.env.MANUS_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl =
    process.env.MANUS_API_BASE ||
    (process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : 'https://api.openai.com/v1');
  const model =
    process.env.AI_MODEL ||
    (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: minorMode ? minorPreviewSystem(locale) : adultPreviewSystem(locale),
        },
        {
          role: 'user',
          content: `命盘数据：\n${JSON.stringify(chart, null, 2)}`,
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const { ok } = rateLimit(`preview:${ip}`, 20, 60_000);
  if (!ok) {
    return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const chart = body.chart as ZiweiChart | undefined;
    const minorMode = Boolean(body.minorMode);
    const locale = resolveAiLocaleFromRequest(req, body);
    if (!chart?.palaces?.length) {
      return NextResponse.json({ error: '缺少命盘数据' }, { status: 400 });
    }
    const text = (await llmPreview(chart, minorMode, locale)) ?? ruleBasedPreview(chart, minorMode, locale);
    return NextResponse.json({ text });
  } catch (err) {
    console.error('[insight/preview]', err);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
