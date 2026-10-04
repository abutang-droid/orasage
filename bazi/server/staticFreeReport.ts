/**
 * 排盘完成后物化固定静态 HTML（唯一落盘入口）。
 *
 * 管线（只保留这一条）：
 *   ensureStaticFreeReport / writePaidReadingReport
 *     → writeReadingReportHtml
 *     → buildReportPageHtml（magazine：四柱命盘 + 五行环形/雷达）
 *     → REPORTS_DIR/reading_<id>.html
 *
 * 禁止再写 report_* / chart_* 文件名。付费与免费共用同一 reading 文件，付费覆盖免费。
 */

import {
  composeFreeReport,
  type FreeReport,
  type FreeReportInput,
} from "../shared/free-report.ts";
import { writeReadingReportHtml, resolveReadingReportPaths } from "./readingReport.ts";

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL ?? "http://127.0.0.1:3101";

export function freeReportToMarkdown(free: FreeReport, opts?: { name?: string; birthStr?: string }): string {
  const lines: string[] = [];
  for (let i = 0; i < free.sections.length; i++) {
    const section = free.sections[i];
    lines.push(`### ${section.title}`);
    lines.push("");
    if (i === 0) {
      if (opts?.birthStr) {
        lines.push(`${opts.name ? `${opts.name} · ` : ""}${opts.birthStr}`);
        lines.push("");
      }
      if (free.gridCaption) {
        lines.push(free.gridCaption);
        lines.push("");
      }
      if (free.dayMasterLine) {
        lines.push(free.dayMasterLine);
        lines.push("");
      }
    }
    lines.push(section.body);
    if (section.classic) {
      lines.push("");
      lines.push(`*${section.classic}*`);
    }
    lines.push("");
  }
  if (free.luckyLine) {
    lines.push("### 方向提示");
    lines.push("");
    lines.push(free.luckyLine);
    if (free.luckyNote) {
      lines.push("");
      lines.push(free.luckyNote);
    }
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

function asFreeInput(data: Record<string, unknown>): FreeReportInput {
  const pillar = (key: string) => {
    const p = data[key] as { gan?: string; zhi?: string } | undefined;
    return { gan: String(p?.gan ?? ""), zhi: String(p?.zhi ?? "") };
  };
  return {
    name: String(data.name ?? "访客"),
    riZhu: String(data.riZhu ?? ""),
    strength: String(data.strength ?? ""),
    favorable: Array.isArray(data.favorable) ? data.favorable.map(String) : [],
    unfavorable: Array.isArray(data.unfavorable) ? data.unfavorable.map(String) : [],
    year: pillar("year"),
    month: pillar("month"),
    day: pillar("day"),
    hour: pillar("hour"),
    shiShen: (data.shiShen && typeof data.shiShen === "object"
      ? (data.shiShen as Record<string, string>)
      : {}) as Record<string, string>,
    pattern: data.pattern as FreeReportInput["pattern"],
  };
}

export type MaterializeResult = {
  reportId: string;
  fileName: string;
  reportUrl: string;
  reportPath: string;
  reused: boolean;
  absolutePath: string;
  readingId: string;
  tier: "free" | "paid";
};

export type MaterializeOpts = {
  readingId: string;
  /** 已付费文件上禁止用 free 覆盖（默认 true） */
  skipIfPaid?: boolean;
  /** 已有 reading HTML 也重写；用户再次进入时不要传 */
  force?: boolean;
};

/** 按 readingId 物化 / 刷新免费层固定报告（每用户每次排盘一份） */
export function ensureStaticFreeReport(
  resultData: Record<string, unknown>,
  lang = "zh-CN",
  opts?: MaterializeOpts,
): MaterializeResult {
  const readingId = opts?.readingId?.trim();
  if (!readingId) {
    throw new Error("readingId required — reports are unique per user generation");
  }

  const input = asFreeInput(resultData);
  if (!input.riZhu || !input.year.gan) {
    throw new Error("invalid chart data for static report");
  }

  const free = composeFreeReport(input, lang);
  const markdown = freeReportToMarkdown(free, {
    name: input.name,
    birthStr: String(resultData.birthStr ?? ""),
  });
  const planLabel = lang.startsWith("zh") ? "结构速览" : "Structure Brief";
  const wuXing = (resultData.wuXing && typeof resultData.wuXing === "object")
    ? (resultData.wuXing as Record<string, number>)
    : undefined;

  const written = writeReadingReportHtml({
    readingId,
    tier: "free",
    planLabel,
    reportContent: markdown,
    subjectName: input.name || undefined,
    locale: lang,
    allowDowngrade: opts?.skipIfPaid === false,
    force: opts?.force === true,
    chart: {
      name: input.name,
      birthStr: String(resultData.birthStr ?? ""),
      birthplace: String(resultData.birthplace ?? resultData.cityName ?? ""),
      gender: String(resultData.gender ?? ""),
      riZhu: input.riZhu,
      strength: input.strength,
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      wuXing,
      dayMasterLine: free.dayMasterLine,
      gridCaption: free.gridCaption,
      luckyLine: free.luckyLine,
      favorable: input.favorable,
    },
  });

  return {
    reportId: written.reportId,
    fileName: written.fileName,
    reportUrl: written.reportUrl,
    reportPath: written.reportPath,
    reused: written.reused || written.skipped,
    absolutePath: written.absolutePath,
    readingId,
    tier: written.tier,
  };
}

/** 付费全文覆盖同一 reading 固定页 */
export function writePaidReadingReport(opts: {
  readingId: string;
  reportContent: string;
  planLabel: string;
  subjectName?: string;
  locale?: string;
  resultData?: Record<string, unknown>;
  productRecommend?: Parameters<typeof writeReadingReportHtml>[0]["productRecommend"];
}) {
  const data = opts.resultData || {};
  const input = asFreeInput(data);
  const wuXing = (data.wuXing && typeof data.wuXing === "object")
    ? (data.wuXing as Record<string, number>)
    : undefined;
  return writeReadingReportHtml({
    readingId: opts.readingId,
    tier: "paid",
    planLabel: opts.planLabel,
    reportContent: opts.reportContent,
    subjectName: opts.subjectName || input.name,
    locale: opts.locale || "zh-CN",
    productRecommend: opts.productRecommend,
    chart: {
      name: input.name,
      birthStr: String(data.birthStr ?? ""),
      birthplace: String(data.birthplace ?? data.cityName ?? ""),
      gender: String(data.gender ?? ""),
      riZhu: input.riZhu || undefined,
      strength: input.strength || undefined,
      year: input.year.gan ? input.year : undefined,
      month: input.month.gan ? input.month : undefined,
      day: input.day.gan ? input.day : undefined,
      hour: input.hour.gan ? input.hour : undefined,
      wuXing,
      favorable: input.favorable,
    },
  });
}

export { resolveReadingReportPaths };

export async function patchReadingReportUrl(readingId: string, reportUrl: string, title?: string) {
  if (!readingId?.trim()) return;
  try {
    const res = await fetch(`${AUTH_INTERNAL}/internal/readings/${encodeURIComponent(readingId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportUrl, ...(title ? { title } : {}) }),
    });
    if (!res.ok) {
      console.warn("[staticFreeReport] patch reading failed", res.status);
    }
  } catch (err) {
    console.warn("[staticFreeReport] patch reading error", err);
  }
}

export async function upsertReadingWithReport(opts: {
  userId?: number | null;
  readingId: string;
  title: string;
  summary?: string;
  reportUrl: string;
  payloadJson?: string;
}): Promise<boolean> {
  if (!opts.readingId?.trim() || !opts.reportUrl) return false;
  try {
    const res = await fetch(`${AUTH_INTERNAL}/internal/readings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: opts.userId && opts.userId > 0 ? opts.userId : 0,
        appSource: "bazi",
        readingId: opts.readingId,
        title: opts.title,
        summary: opts.summary,
        reportUrl: opts.reportUrl,
        payloadJson: opts.payloadJson,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("[staticFreeReport] upsert reading failed", res.status, text.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[staticFreeReport] upsert reading error", err);
    return false;
  }
}
