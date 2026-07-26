import { Router } from "express";
import { z } from "zod";
import { estimateShippingFeeFromDb } from "../lib/shipping-zones.ts";
import { invokeLLM, isLlmConfigured } from "../lib/llm.ts";
import {
  aiLanguageReplyRule,
  aiPromptLanguageLine,
  readLocaleFromCookieHeader,
  resolveAiLocale,
  type AiLocale,
} from "../../../shared/ai-locale/index.ts";
import { findShippingCountry } from "../../../shared/shop-fulfillment/geo.ts";
import { staticRegionsForCountry } from "../../../shared/shop-fulfillment/region-fallback.ts";

export const shippingRouter = Router();

/** GET /api/shipping/estimate?country=US&recipients=1&weightGrams=600 */
shippingRouter.get("/estimate", async (req, res) => {
  try {
    const country = String(req.query.country ?? "CN");
    const recipients = Math.max(1, Number(req.query.recipients) || 1);
    const weightRaw = req.query.weightGrams;
    const weightGrams = weightRaw != null && weightRaw !== "" ? Number(weightRaw) : null;
    const feeCents = await estimateShippingFeeFromDb(
      country,
      recipients,
      Number.isFinite(weightGrams) ? weightGrams : null,
    );
    res.json({ feeCents, country, recipients, weightGrams: weightGrams ?? null });
  } catch (err) {
    console.error("[shipping] estimate:", err);
    res.status(500).json({ error: "运费估算失败" });
  }
});

const regionsQuerySchema = z.object({
  country: z.string().min(2).max(2),
  province: z.string().max(120).optional(),
  locale: z.string().max(12).optional(),
  language: z.string().max(12).optional(),
  lang: z.string().max(12).optional(),
});

type RegionsCacheEntry = { at: number; items: string[] };
const regionsCache = new Map<string, RegionsCacheEntry>();
const REGIONS_CACHE_MS = 24 * 60 * 60 * 1000;

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeNameList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const name = item.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
    if (out.length >= 80) break;
  }
  return out;
}

function resolveRequestLocale(req: {
  query: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}): AiLocale {
  const q = req.query;
  return resolveAiLocale({
    language: typeof q.language === "string" ? q.language : undefined,
    locale: typeof q.locale === "string" ? q.locale : undefined,
    lang: typeof q.lang === "string" ? q.lang : undefined,
    acceptLanguage: typeof req.headers["accept-language"] === "string"
      ? req.headers["accept-language"]
      : null,
    cookieLocale: readLocaleFromCookieHeader(
      typeof req.headers.cookie === "string" ? req.headers.cookie : null,
    ),
  });
}

/**
 * GET /api/shipping/regions?country=US&locale=en
 * GET /api/shipping/regions?country=US&province=California&locale=en
 *
 * After continent+country (and optional province) selection, load admin divisions via AI.
 * On miss / LLM unavailable → empty list so the client can fall back to manual input.
 */
shippingRouter.get("/regions", async (req, res) => {
  const parsed = regionsQuerySchema.safeParse({
    country: typeof req.query.country === "string" ? req.query.country.toUpperCase() : undefined,
    province: typeof req.query.province === "string" ? req.query.province : undefined,
    locale: typeof req.query.locale === "string" ? req.query.locale : undefined,
    language: typeof req.query.language === "string" ? req.query.language : undefined,
    lang: typeof req.query.lang === "string" ? req.query.lang : undefined,
  });
  if (!parsed.success) {
    res.status(400).json({ error: "invalid country", items: [], manual: true });
    return;
  }

  const { country, province } = parsed.data;
  const aiLocale = resolveRequestLocale(req);
  const cacheKey = `${country}|${province?.trim() || ""}|${aiLocale}`;
  const cached = regionsCache.get(cacheKey);
  if (cached && Date.now() - cached.at < REGIONS_CACHE_MS) {
    res.json({
      country,
      province: province || null,
      items: cached.items,
      source: "cache",
      manual: cached.items.length === 0,
    });
    return;
  }

  if (!isLlmConfigured()) {
    // Province→city still needs AI; country→province can use static fallbacks.
    const staticItems = province?.trim()
      ? []
      : staticRegionsForCountry(country, aiLocale);
    res.json({
      country,
      province: province || null,
      items: staticItems,
      source: staticItems.length ? "static" : "unavailable",
      manual: staticItems.length === 0,
      suggestion: staticItems.length
        ? undefined
        : "Region list unavailable — please enter manually",
    });
    return;
  }

  const meta = findShippingCountry(country);
  const countryName = meta
    ? (aiLocale.startsWith("zh") ? meta.labelZh : meta.labelEn)
    : country;
  const level = province?.trim()
    ? "cities"
    : "regions";

  const prompt = province?.trim()
    ? `${aiPromptLanguageLine(aiLocale)}
List major cities / secondary administrative divisions for shipping addresses in:
country ISO ${country} (${countryName}), province/state/region "${province.trim()}".
Return JSON only:
{"items":["..."],"found":true}
Rules:
- Use place names in the reply language
- Prefer commonly used shipping city names (max 60)
- If unknown, return {"found":false,"items":[],"suggestion":"..."}`
    : `${aiPromptLanguageLine(aiLocale)}
List all first-level administrative divisions (states / provinces / regions / prefectures)
for shipping addresses in country ISO ${country} (${countryName}).
Return JSON only:
{"items":["..."],"found":true}
Rules:
- Complete list of top-level divisions when possible (e.g. US states, China provinces)
- Use official or commonly used names in the reply language
- Max 80 items
- If unknown, return {"found":false,"items":[],"suggestion":"..."}`;

  try {
    const response = await invokeLLM(
      [
        {
          role: "system",
          content: `You are a geography assistant for e-commerce shipping forms. Return JSON only. ${aiLanguageReplyRule(aiLocale)}`,
        },
        { role: "user", content: prompt },
      ],
      { maxTokens: 2048 },
    );
    const content = response.choices?.[0]?.message?.content ?? "";
    const json = extractJsonObject(content);
    const items = normalizeNameList(json?.items ?? json?.regions ?? json?.cities);
    const found = json?.found !== false && items.length > 0;
    let finalItems = found ? items : [];
    let source: "ai" | "static" = "ai";
    if (finalItems.length === 0 && !province?.trim()) {
      finalItems = staticRegionsForCountry(country, aiLocale);
      if (finalItems.length) source = "static";
    }
    regionsCache.set(cacheKey, { at: Date.now(), items: finalItems });
    res.json({
      country,
      province: province || null,
      items: finalItems,
      source,
      level,
      manual: finalItems.length === 0,
      suggestion: typeof json?.suggestion === "string" ? json.suggestion : undefined,
    });
  } catch (err) {
    console.error("[shipping] regions:", err);
    const staticItems = province?.trim()
      ? []
      : staticRegionsForCountry(country, aiLocale);
    res.json({
      country,
      province: province || null,
      items: staticItems,
      source: staticItems.length ? "static" : "error",
      manual: staticItems.length === 0,
      suggestion: staticItems.length
        ? undefined
        : "Could not load regions — please enter manually",
    });
  }
});
