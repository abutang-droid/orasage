import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { authCookieHeader, resolveAuthUserIdFromCookies } from '@/lib/auth-user-server';
import {
  adultInterpretSystem,
  minorInterpretSystem,
} from '@/lib/ai-prompts';
import { resolveAiLocaleFromRequest } from '../../../../shared/ai-locale/index';

export const runtime = 'nodejs';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const { ok } = rateLimit(`interpret:${ip}`, 20, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试。' },
        { status: 429 },
      );
    }

    const userId = await resolveAuthUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: '请先登录后再提问', code: 'auth_required' }, { status: 401 });
    }

    const body = await req.json();
    const { messages, chartData, mode, readingId, minorMode } = body;
    const locale = resolveAiLocaleFromRequest(req, body);

    if (!readingId || typeof readingId !== 'string') {
      return NextResponse.json({ error: '缺少 readingId' }, { status: 400 });
    }

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
      return NextResponse.json({ error: '参数错误：messages 无效' }, { status: 400 });
    }

    const cookie = await authCookieHeader();
    const consumeRes = await fetch(`${AUTH_INTERNAL}/api/ziwei/chat/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ readingId }),
      cache: 'no-store',
    });
    const consumeData = await consumeRes.json().catch(() => ({}));
    if (!consumeRes.ok) {
      return NextResponse.json(
        {
          error: consumeData.error === 'quota_exhausted' ? '问答次数已用完，请购买加量包或年卡' : '额度校验失败',
          code: consumeData.error ?? 'quota_error',
          quota: consumeData.quota,
        },
        { status: consumeRes.status },
      );
    }

    const apiKey =
      process.env.MANUS_API_KEY ||
      process.env.DEEPSEEK_API_KEY ||
      process.env.OPENAI_API_KEY;

    const baseUrl =
      process.env.MANUS_API_BASE ||
      (process.env.DEEPSEEK_API_KEY
        ? 'https://api.deepseek.com/v1'
        : 'https://api.openai.com/v1');

    const model =
      process.env.AI_MODEL ||
      (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-5-mini');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI 解读功能暂未配置，请联系管理员设置 API Key。' },
        { status: 503 }
      );
    }

    let systemContent = minorMode ? minorInterpretSystem(locale) : adultInterpretSystem(locale);
    if (chartData) {
      const modeLabel = minorMode
        ? (mode === 'heming' ? '合盘（含未成年人，整体按青少年保护解读）' : '单人命盘（未成年人）')
        : (mode === 'heming' ? '合盘（两人缘分）' : '单人命盘');
      systemContent += `\n\n当前解读模式：${modeLabel}\n命盘数据：\n${JSON.stringify(chartData, null, 2)}`;
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemContent },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('AI API error:', err);
      return NextResponse.json(
        { error: 'AI 服务暂时不可用，请稍后再试。' },
        { status: 502 }
      );
    }

    // 流式返回
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {}
              }
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Ziwei-Quota': JSON.stringify(consumeData.quota ?? {}),
      },
    });
  } catch (e) {
    console.error('interpret route error:', e);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
