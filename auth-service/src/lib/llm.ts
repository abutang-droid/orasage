import { ENV } from "../env.ts";

type Message = { role: "system" | "user" | "assistant"; content: string };

type InvokeResult = {
  choices: Array<{
    message: { content: string };
  }>;
};

function resolveApiUrl(): string {
  if (ENV.deepseekApiKey) return "https://api.deepseek.com/v1/chat/completions";
  const forgeUrl = ENV.forgeApiUrl?.trim();
  if (forgeUrl) return `${forgeUrl.replace(/\/$/, "")}/v1/chat/completions`;
  throw new Error("LLM API not configured");
}

function resolveApiKey(): string {
  if (ENV.deepseekApiKey) return ENV.deepseekApiKey;
  if (ENV.forgeApiKey) return ENV.forgeApiKey;
  throw new Error("LLM API key not configured");
}

export function isLlmConfigured(): boolean {
  return Boolean(ENV.deepseekApiKey || ENV.forgeApiKey);
}

export async function invokeLLM(messages: Message[]): Promise<InvokeResult> {
  const payload: Record<string, unknown> = {
    model: ENV.deepseekApiKey ? "deepseek-chat" : "gemini-2.5-flash",
    messages,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  };

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${resolveApiKey()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${text}`);
  }

  return (await response.json()) as InvokeResult;
}
