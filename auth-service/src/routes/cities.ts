import { Router } from "express";
import { z } from "zod";
import { listConfirmedCities, upsertConfirmedCity } from "../lib/city-db.ts";
import { invokeLLM, isLlmConfigured } from "../lib/llm.ts";
import {
  aiLanguageReplyRule,
  aiPromptLanguageLine,
  readLocaleFromCookieHeader,
  resolveAiLocale,
  type AiLocale,
} from "../../../shared/ai-locale/index.ts";

const lookupSchema = z.object({
  query: z.string().min(1).max(200),
  language: z.string().max(12).optional(),
  locale: z.string().max(12).optional(),
  lang: z.string().max(12).optional(),
});

const confirmSchema = z.object({
  query: z.string().min(1).max(200),
  city: z.string().min(1).max(64),
  province: z.string().max(64).default(""),
  country: z.string().min(1).max(64),
  lng: z.number(),
  lat: z.number(),
  timezone: z.string().max(8),
  alias: z.array(z.string()).optional(),
});

function extractJson(raw: string): Record<string, unknown> | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function clampConfidence(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0.7;
  return Math.min(1, Math.max(0, n));
}

export const citiesRouter = Router();

citiesRouter.get("/", async (_req, res) => {
  try {
    const cities = await listConfirmedCities();
    res.json({ cities });
  } catch (err) {
    console.error("[cities] list:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

citiesRouter.post("/lookup", async (req, res) => {
  const parsed = lookupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "无效的查询参数" });
    return;
  }

  if (!isLlmConfigured()) {
    res.status(503).json({
      found: false,
      suggestion: "城市智能匹配暂不可用，请尝试输入完整地名或上级行政单位",
    });
    return;
  }

  const { query, language, locale, lang } = parsed.data;
  const aiLocale: AiLocale = resolveAiLocale({
    language,
    locale,
    lang,
    acceptLanguage: typeof req.headers["accept-language"] === "string"
      ? req.headers["accept-language"]
      : null,
    cookieLocale: readLocaleFromCookieHeader(
      typeof req.headers.cookie === "string" ? req.headers.cookie : null,
    ),
  });

  const prompt = `${aiPromptLanguageLine(aiLocale)}
用户输入了一个全球地名"${query}"，请识别该地点并返回 JSON：
{
  "city": "城市/地点名称（使用与回复语言一致的地名写法；中文界面优先中文名，英文界面可用常用英文名）",
  "country": "国家",
  "province": "省/州/都道府县等上级行政区",
  "lng": 经度数字（WGS84，西经为负）,
  "lat": 纬度数字（WGS84，南纬为负）,
  "timezone": "UTC偏移（如\\"+8\\"、\\"-5\\"）",
  "confidence": 0到1之间的置信度数字,
  "suggestion": "若不确定，给用户的提示（使用与回复语言一致的文案）"
}
支持全球城市；中国县级市请尽量给出准确坐标。
若完全无法识别，返回 {"found": false, "suggestion": "..."}。
只返回 JSON。`;

  try {
    const response = await invokeLLM([
      { role: "system", content: `你是地理信息助手。只返回 JSON，不要解释。${aiLanguageReplyRule(aiLocale)}` },
      { role: "user", content: prompt },
    ]);

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      res.json({ found: false, suggestion: "未找到该城市，可尝试输入上级行政单位或「国家+城市」" });
      return;
    }

    const parsedJson = extractJson(content);
    if (!parsedJson || parsedJson.found === false) {
      res.json({
        found: false,
        suggestion:
          (typeof parsedJson?.suggestion === "string" && parsedJson.suggestion) ||
          "未找到该城市，可尝试输入上级行政单位或「国家+城市」",
      });
      return;
    }

    if (!parsedJson.city || parsedJson.lng == null || parsedJson.lat == null) {
      res.json({ found: false, suggestion: "未找到该城市，可尝试输入上级行政单位或「国家+城市」" });
      return;
    }

    res.json({
      city: String(parsedJson.city),
      country: String(parsedJson.country || "未知"),
      province: String(parsedJson.province || ""),
      lng: Number(parsedJson.lng),
      lat: Number(parsedJson.lat),
      timezone: String(parsedJson.timezone || "+8"),
      confidence: clampConfidence(parsedJson.confidence),
      suggestion: typeof parsedJson.suggestion === "string" ? parsedJson.suggestion : undefined,
    });
  } catch (err) {
    console.error("[cities] lookup:", err);
    res.status(500).json({ error: "城市查询失败" });
  }
});

citiesRouter.post("/confirm", async (req, res) => {
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "无效的确认参数" });
    return;
  }

  const body = parsed.data;
  try {
    const city = await upsertConfirmedCity({
      city: body.city,
      province: body.province,
      country: body.country,
      lng: body.lng,
      lat: body.lat,
      timezone: body.timezone,
      alias: body.alias,
      searchKey: body.query,
    });
    res.json({ ok: true, city });
  } catch (err) {
    console.error("[cities] confirm:", err);
    res.status(500).json({ error: "保存城市失败" });
  }
});
