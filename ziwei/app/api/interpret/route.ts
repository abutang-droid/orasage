import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `你是一位精通紫微斗数的命理师，拥有深厚的东方传统命理学知识，同时融合现代心理学视角。
你的解读风格：
- 温暖、专业、有洞察力
- 用现代语言诠释传统命理，避免晦涩术语
- 结合心理学视角，帮助用户理解自身特质
- 客观中立，不做绝对化预言
- 中文回答，语言流畅自然`;

export async function POST(req: NextRequest) {
  try {
    // 此接口此前完全无鉴权、无限流，任何人都能无限调用消耗第三方 AI API 额度。
    // 加一层按 IP 的简单限流作为最低成本的防护（10 次/分钟）。
    const ip = clientIp(req);
    const { ok } = rateLimit(`interpret:${ip}`, 10, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试。' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, chartData, mode } = body;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) {
      return NextResponse.json({ error: '参数错误：messages 无效' }, { status: 400 });
    }

    // 优先使用 Manus 代理接口，其次 DeepSeek，最后 OpenAI
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

    // 构建系统提示（附带命盘数据）
    let systemContent = SYSTEM_PROMPT;
    if (chartData) {
      const modeLabel = mode === 'heming' ? '合盘（两人缘分）' : '单人命盘';
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
      },
    });
  } catch (e) {
    console.error('interpret route error:', e);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
