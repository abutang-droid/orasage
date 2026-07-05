import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { SUGGESTIONS_SYSTEM, MINOR_SUGGESTIONS_SYSTEM } from '@/lib/ai-prompts';

export const runtime = 'nodejs';

const FALLBACK_ADULT = [
  '能再详细说说命宫主星吗？',
  '当前大限有什么要注意的？',
  '三方四正格局如何理解？',
];

const FALLBACK_MINOR = [
  '学习上有什么具体建议？',
  '健康方面还要注意什么？',
  '未来适合往哪些方向探索？',
];

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const { ok } = rateLimit(`suggestions:${ip}`, 30, 60_000);
  if (!ok) {
    return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { messages, minorMode } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: '缺少对话上下文' }, { status: 400 });
    }

    const apiKey =
      process.env.MANUS_API_KEY ||
      process.env.DEEPSEEK_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        suggestions: minorMode ? FALLBACK_MINOR : FALLBACK_ADULT,
      });
    }

    const baseUrl =
      process.env.MANUS_API_BASE ||
      (process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : 'https://api.openai.com/v1');
    const model =
      process.env.AI_MODEL ||
      (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');

    const recent = messages.slice(-6);
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 200,
        messages: [
          {
            role: 'system',
            content: minorMode ? MINOR_SUGGESTIONS_SYSTEM : SUGGESTIONS_SYSTEM,
          },
          {
            role: 'user',
            content: `对话记录：\n${JSON.stringify(recent)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({
        suggestions: minorMode ? FALLBACK_MINOR : FALLBACK_ADULT,
      });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';
    let suggestions: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        suggestions = parsed.filter((s) => typeof s === 'string' && s.trim()).slice(0, 4);
      }
    } catch {
      suggestions = raw
        .split(/\n|、/)
        .map((s: string) => s.replace(/^[\d.、\-\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 4);
    }

    if (suggestions.length === 0) {
      suggestions = minorMode ? FALLBACK_MINOR : FALLBACK_ADULT;
    }

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('[chat/suggestions]', err);
    return NextResponse.json({ suggestions: FALLBACK_ADULT });
  }
}
