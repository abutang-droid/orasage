import { NextRequest, NextResponse } from 'next/server';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

function ruleBasedPreview(chart: ZiweiChart): string {
  const ming = chart.palaces.find((p) => p.name === '命宫');
  const major = ming?.stars.filter((s) => s.type === 'major').map((s) => s.name).join('、') || '空宫借星';
  const name = chart.birthInfo.name?.trim() || '命主';
  const dx = chart.daXians[chart.currentDaXianIndex];
  return `【${name}】${chart.wuxingJuName}命盘

命宫主星：${major}

命盘以命宫为核心，三方四正联动财帛、官禄、迁移诸宫，勾勒性格底色与人生节奏。当前大限${dx ? `在${chart.palaces.find((p) => p.branch === dx.palaceBranch)?.name ?? '—'}，${dx.startAge}–${dx.endAge}岁` : '待起'}，宜先认清自身能量模式，再顺势而为。

登录后可向 Orasage 提问，获取针对你命盘的具体解读（每份排盘赠送 5 次免费对话）。`;
}

async function llmPreview(chart: ZiweiChart): Promise<string | null> {
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
          content: '你是紫微斗数命理师。用温暖专业的中文写一段约300字的命盘简读，含命格定性、命宫主星、当前大限一句、一句建议。不要 markdown 标题。',
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
    if (!chart?.palaces?.length) {
      return NextResponse.json({ error: '缺少命盘数据' }, { status: 400 });
    }
    const text = (await llmPreview(chart)) ?? ruleBasedPreview(chart);
    return NextResponse.json({ text });
  } catch (err) {
    console.error('[insight/preview]', err);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
