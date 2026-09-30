import type { SingleBaziResult } from "@/lib/bazi";
import { attachBaziReportUrl } from "@/lib/reading-sync";

const STATIC_URL_KEY = "bazi:staticReportUrl";
const STATIC_PATH_KEY = "bazi:staticReportPath";
const STATIC_ID_KEY = "bazi:staticReportId";

type MaterializeFn = (input: {
  lang: "zh-CN" | "zh-TW" | "en" | "pt-BR";
  resultData: Record<string, unknown>;
  readingId?: string;
}) => Promise<{
  reportUrl: string;
  reportPath: string;
  reused: boolean;
  reportId: string;
  readingId?: string;
}>;

export function saveStaticReportUrl(reportUrl: string, reportPath?: string, reportId?: string) {
  try {
    sessionStorage.setItem(STATIC_URL_KEY, reportUrl);
    if (reportPath) sessionStorage.setItem(STATIC_PATH_KEY, reportPath);
    if (reportId) sessionStorage.setItem(STATIC_ID_KEY, reportId);
  } catch {
    /* ignore */
  }
}

/** 优先返回同域相对路径，便于本地 / 生产直接打开 */
export function getStaticReportHref(): string | null {
  try {
    const path = sessionStorage.getItem(STATIC_PATH_KEY);
    if (path) return path;
    return sessionStorage.getItem(STATIC_URL_KEY);
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
    return sessionStorage.getItem(STATIC_URL_KEY);
  } catch {
    return null;
  }
}

/** 排盘完成后物化固定静态 HTML；同盘复用已有文件 */
export async function materializeStaticReport(opts: {
  result: SingleBaziResult;
  lang: string;
  readingId?: string | null;
  mutateAsync: MaterializeFn;
}): Promise<{ reportUrl: string; reportPath: string; reused: boolean; reportId: string } | null> {
  try {
    const lang = (["zh-CN", "zh-TW", "en", "pt-BR"].includes(opts.lang)
      ? opts.lang
      : "zh-CN") as "zh-CN" | "zh-TW" | "en" | "pt-BR";
    const data = await opts.mutateAsync({
      lang,
      resultData: opts.result as unknown as Record<string, unknown>,
      readingId: opts.readingId ?? undefined,
    });
    saveStaticReportUrl(data.reportUrl, data.reportPath, data.reportId);
    const readingId = opts.readingId || data.readingId;
    if (readingId && data.reportUrl) {
      const name = String(opts.result.name ?? "").trim() || "访客";
      attachBaziReportUrl(readingId, data.reportUrl, {
        name,
        summary: `日主 ${opts.result.riZhu} · ${opts.result.strength}`,
      });
    }
    return data;
  } catch (err) {
    console.warn("[static-report] materialize failed", err);
    return null;
  }
}
