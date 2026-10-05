import type { SingleBaziResult } from "@/lib/bazi";
import { attachBaziReportUrl, newReadingId } from "@/lib/reading-sync";
import { getLastReadingId, saveLastReadingId } from "@/_core/hooks/usePaymentFlow";
import { getDeviceId } from "@/lib/device-id";

const STATIC_URL_KEY = "bazi:staticReportUrl";
const STATIC_PATH_KEY = "bazi:staticReportPath";
const STATIC_ID_KEY = "bazi:staticReportId";
const LAST_PATH_KEY = "bazi:lastReportPath";

type MaterializeFn = (input: {
  lang: "zh-CN" | "zh-TW" | "en" | "pt-BR";
  resultData: Record<string, unknown>;
  deviceId: string;
  readingId?: string;
}) => Promise<{
  reportUrl: string;
  reportPath: string;
  reused: boolean;
  reportId: string;
  readingId?: string;
  tier?: "free" | "paid";
}>;

function setBoth(storage: Storage, key: string, value: string) {
  storage.setItem(key, value);
}

function readFirst(...values: Array<string | null | undefined>): string | null {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return null;
}

/** 确保有本会话的 readingId（每用户每次排盘一份固定报告） */
export function ensureReadingId(explicit?: string | null): string {
  const fromArg = explicit?.trim();
  if (fromArg) {
    saveLastReadingId(fromArg);
    return fromArg;
  }
  const existing = getLastReadingId();
  if (existing?.trim()) return existing.trim();
  const created = newReadingId("bazi");
  saveLastReadingId(created);
  return created;
}

export function saveStaticReportUrl(reportUrl: string, reportPath?: string, reportId?: string) {
  const path = (reportPath || reportPathFromHref(reportUrl)).split("?")[0];
  try {
    setBoth(sessionStorage, STATIC_URL_KEY, reportUrl);
    if (path) setBoth(sessionStorage, STATIC_PATH_KEY, path);
    if (reportId) setBoth(sessionStorage, STATIC_ID_KEY, reportId);
  } catch {
    /* ignore */
  }
  try {
    setBoth(localStorage, STATIC_URL_KEY, reportUrl);
    if (path) {
      setBoth(localStorage, STATIC_PATH_KEY, path);
      setBoth(localStorage, LAST_PATH_KEY, path);
    }
    if (reportId) setBoth(localStorage, STATIC_ID_KEY, reportId);
  } catch {
    /* ignore */
  }
}

export function reportPathFromHref(href: string): string {
  const raw = href.trim();
  if (!raw) return "";
  if (raw.startsWith("/")) return raw.split("?")[0];
  try {
    return new URL(raw, typeof window === "undefined" ? "https://bazi.orasage.com" : window.location.origin)
      .pathname;
  } catch {
    return raw.split("?")[0];
  }
}

/** 优先返回同域相对路径，便于本地 / 生产直接打开 */
export function getStaticReportHref(): string | null {
  try {
    return readFirst(
      sessionStorage.getItem(STATIC_PATH_KEY),
      sessionStorage.getItem(STATIC_URL_KEY),
      localStorage.getItem(STATIC_PATH_KEY),
      localStorage.getItem(LAST_PATH_KEY),
      localStorage.getItem(STATIC_URL_KEY),
    );
  } catch {
    return null;
  }
}

/** @deprecated use getStaticReportHref */
export function getStaticReportUrl(): string | null {
  return getStaticReportHref();
}

/** 绝对报告 URL（同步到 auth user_readings.report_url，需通过 URL 校验） */
export function getStaticReportAbsoluteUrl(): string | null {
  try {
    return readFirst(sessionStorage.getItem(STATIC_URL_KEY), localStorage.getItem(STATIC_URL_KEY));
  } catch {
    return null;
  }
}

export function reportPathForReadingId(readingId: string): string {
  const safe = readingId
    .trim()
    .replace(/[^a-zA-Z0-9._:-]/g, "_")
    .replace(/:/g, "_")
    .slice(0, 96);
  return `/reports/reading_${safe}.html`;
}

export function parseReportTierFromHtml(html: string): "paid" | "free" | null {
  const head = html.slice(0, 1600);
  if (/data-report-tier=["']paid["']/.test(head)) return "paid";
  if (/data-report-tier=["']free["']/.test(head)) return "free";
  if (head.includes("paywall-section") || head.includes("解锁完整命局报告")) return "free";
  return null;
}

export async function probeReportTier(href?: string | null): Promise<{ path: string; tier: "paid" | "free" } | null> {
  const candidate = href || getStaticReportHref();
  if (!candidate) return null;
  const path = reportPathFromHref(candidate);
  if (!path.startsWith("/reports/")) return null;
  try {
    const res = await fetch(path, { method: "GET", cache: "no-store" });
    if (!res.ok) return null;
    const html = await res.text();
    const tier = parseReportTierFromHtml(html);
    if (tier === "paid") return { path, tier: "paid" };
    return { path, tier: "free" };
  } catch {
    return null;
  }
}

export async function probeFixedReport(href?: string | null): Promise<string | null> {
  const hit = await probeReportTier(href);
  return hit?.path ?? null;
}

/** 支付回跳：等到同一文件变成 paid 再打开。禁止把仍带付费墙的 free 页当成交结果。 */
export async function waitForPaidReport(
  href: string,
  opts?: { timeoutMs?: number; intervalMs?: number; signal?: AbortSignal },
): Promise<string | null> {
  const path = reportPathFromHref(href);
  if (!path) return null;
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  const intervalMs = opts?.intervalMs ?? 2000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (opts?.signal?.aborted) return null;
    const hit = await probeReportTier(path);
    if (hit?.tier === "paid") return hit.path;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}

/** 打开已落盘的长图 HTML（整页，不嵌 iframe） */
export function openFixedReportPage(href: string) {
  const path = reportPathFromHref(href);
  if (!path) return;
  saveStaticReportUrl(path.startsWith("http") ? href : path, path);
  window.location.replace(path);
}

/** 排盘完成后物化固定静态 HTML；同一账号/设备 + 同一输入复用同一文件 */
export async function materializeStaticReport(opts: {
  result: SingleBaziResult | Record<string, unknown>;
  lang: string;
  readingId?: string | null;
  mutateAsync: MaterializeFn;
}): Promise<{
  reportUrl: string;
  reportPath: string;
  reused: boolean;
  reportId: string;
  readingId: string;
  tier?: "free" | "paid";
} | null> {
  try {
    const lang = (["zh-CN", "zh-TW", "en", "pt-BR"].includes(opts.lang)
      ? opts.lang
      : "zh-CN") as "zh-CN" | "zh-TW" | "en" | "pt-BR";
    const data = await opts.mutateAsync({
      lang,
      resultData: opts.result as unknown as Record<string, unknown>,
      deviceId: getDeviceId(),
      readingId: opts.readingId?.trim() || undefined,
    });
    const readingId = (data.readingId || "").trim();
    if (readingId) saveLastReadingId(readingId);
    saveStaticReportUrl(data.reportUrl, data.reportPath, data.reportId);
    if (data.reportUrl && readingId) {
      const raw = opts.result as Record<string, unknown>;
      const name = String(raw.name ?? "").trim() || "访客";
      const riZhu = String(raw.riZhu ?? "");
      const strength = String(raw.strength ?? "");
      attachBaziReportUrl(readingId, data.reportUrl, {
        name,
        summary: riZhu ? `日主 ${riZhu} · ${strength}` : undefined,
      });
    }
    return { ...data, readingId: readingId || data.reportId };
  } catch (err) {
    console.warn("[static-report] materialize failed", err);
    return null;
  }
}
