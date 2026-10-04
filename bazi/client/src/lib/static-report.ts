import type { SingleBaziResult } from "@/lib/bazi";
import { attachBaziReportUrl, newReadingId } from "@/lib/reading-sync";
import { getLastReadingId, saveLastReadingId } from "@/_core/hooks/usePaymentFlow";

const STATIC_URL_KEY = "bazi:staticReportUrl";
const STATIC_PATH_KEY = "bazi:staticReportPath";
const STATIC_ID_KEY = "bazi:staticReportId";
const LAST_PATH_KEY = "bazi:lastReportPath";

type MaterializeFn = (input: {
  lang: "zh-CN" | "zh-TW" | "en" | "pt-BR";
  resultData: Record<string, unknown>;
  readingId: string;
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

export async function probeFixedReport(href?: string | null): Promise<string | null> {
  const candidate = href || getStaticReportHref();
  if (!candidate) return null;
  const path = reportPathFromHref(candidate);
  if (!path.startsWith("/reports/")) return null;
  try {
    const res = await fetch(path, { method: "GET", cache: "no-store" });
    if (res.ok) return path;
  } catch {
    /* ignore */
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

/** 排盘完成后物化固定静态 HTML；按 readingId 一人一份，付费后覆盖同一文件 */
export async function materializeStaticReport(opts: {
  result: SingleBaziResult;
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
    const readingId = ensureReadingId(opts.readingId);
    const data = await opts.mutateAsync({
      lang,
      resultData: opts.result as unknown as Record<string, unknown>,
      readingId,
    });
    saveStaticReportUrl(data.reportUrl, data.reportPath, data.reportId);
    if (data.reportUrl) {
      const name = String(opts.result.name ?? "").trim() || "访客";
      attachBaziReportUrl(readingId, data.reportUrl, {
        name,
        summary: `日主 ${opts.result.riZhu} · ${opts.result.strength}`,
      });
    }
    return { ...data, readingId };
  } catch (err) {
    console.warn("[static-report] materialize failed", err);
    return null;
  }
}
