import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { transcribeAudioBuffer } from "./_core/voiceTranscription";
import {
  mergeLuopanSpeechFields,
  parseLlmSpeechJson,
  parseLuopanSpeech,
  type LuopanSpeechFields,
} from "../client/src/pages/luopan/speechParse";

const WHISPER_PROMPT =
  "用户口述八字排盘信息，可能包含姓名、公历或农历年月日、几点几分、出生城市、男或女。";

const NLU_SYSTEM = `你是八字排盘的语音理解器。从用户口述中提取排盘字段。只返回 JSON，不要解释。
JSON 形状：
{"name":string|null,"gender":"女"|"男"|null,"calendar":"solar"|"lunar"|null,"year":number|null,"month":number|null,"day":number|null,"hour":number|null,"minute":number|null,"city":string|null,"leap":boolean}
规则：
- 没听到的字段必须是 null，禁止编造。
- calendar：农历/阴历/正月/腊月/初几 → lunar；公历/阳历 → solar。
- hour 用 0–23。下午三点=15；晚上七点=19；晚上两点=2（凌晨）；子时=23，午时=11。
- minute：三点半=30，一刻=15。
- city 只留城市名，去掉省/市/县/区后缀。
- leap 仅当明确说闰月时为 true。`;

const NLU_TIMEOUT_MS = 8000;
const STT_TIMEOUT_MS = 20000;
const MAX_AUDIO_BYTES = 900_000;

export type LuopanVoiceCapabilities = {
  stt: boolean;
  nlu: boolean;
};

export function luopanVoiceCapabilities(): LuopanVoiceCapabilities {
  const forge = Boolean(ENV.forgeApiUrl?.trim() && ENV.forgeApiKey?.trim());
  const nlu = Boolean(ENV.deepseekApiKey?.trim() || ENV.forgeApiKey?.trim());
  return { stt: forge, nlu };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function llmText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part === "object" && part && "text" in part ? String(part.text ?? "") : "")).join("");
  }
  return "";
}

export async function transcribeLuopanAudio(
  audioBuffer: Buffer,
  mimeType: string,
): Promise<string | null> {
  if (!luopanVoiceCapabilities().stt) return null;
  if (audioBuffer.length < 200 || audioBuffer.length > MAX_AUDIO_BYTES) return null;
  const mime = (mimeType || "audio/webm").slice(0, 80);
  const result = await withTimeout(
    transcribeAudioBuffer(audioBuffer, mime, { language: "zh", prompt: WHISPER_PROMPT }),
    STT_TIMEOUT_MS,
    "whisper",
  );
  if ("error" in result) {
    console.warn("luopan whisper", result.code, result.details);
    return null;
  }
  const text = result.text?.trim();
  return text || null;
}

async function extractWithLlm(transcript: string): Promise<Partial<LuopanSpeechFields> | null> {
  if (!luopanVoiceCapabilities().nlu) return null;
  const response = await withTimeout(
    invokeLLM({
      messages: [
        { role: "system", content: NLU_SYSTEM },
        { role: "user", content: transcript },
      ],
      responseFormat: { type: "json_object" },
    }),
    NLU_TIMEOUT_MS,
    "nlu",
  );
  const raw = llmText(response.choices?.[0]?.message?.content);
  return parseLlmSpeechJson(raw);
}

export async function extractLuopanBirth(transcript: string): Promise<{
  fields: LuopanSpeechFields;
  parse: "llm" | "regex";
}> {
  const fallback = parseLuopanSpeech(transcript);
  try {
    const llm = await extractWithLlm(transcript);
    if (!llm) return { fields: fallback, parse: "regex" };
    return { fields: mergeLuopanSpeechFields(llm, fallback), parse: "llm" };
  } catch (err) {
    console.warn("luopan nlu fallback regex", err instanceof Error ? err.message : err);
    return { fields: fallback, parse: "regex" };
  }
}
