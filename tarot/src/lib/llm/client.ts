/** DeepSeek / OpenAI-compatible chat completion for tarot */

export function isLlmConfigured(): boolean {
  return !!(process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY);
}

function resolveLlmConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl =
    process.env.DEEPSEEK_BASE_URL ||
    (process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : 'https://api.openai.com/v1');
  const model =
    process.env.DEEPSEEK_MODEL ||
    process.env.AI_MODEL ||
    (process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini');
  return { apiKey, baseUrl, model };
}

export async function chatCompletion(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}): Promise<string | null> {
  const { apiKey, baseUrl, model } = resolveLlmConfig();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? 25000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
        temperature: opts.temperature ?? 0.75,
        max_tokens: opts.maxTokens ?? 1200,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn('[llm] API error:', res.status, text.slice(0, 200));
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    return typeof content === 'string' && content.trim() ? content.trim() : null;
  } catch (err) {
    console.warn('[llm] request failed:', err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Extract JSON object from model output (may be wrapped in markdown fences). */
export function parseJsonFromLlm<T>(raw: string): T | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
