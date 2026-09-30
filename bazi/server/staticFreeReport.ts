/**
 * 排盘完成后物化免费结构速览为固定静态 HTML。
 * 文件名由盘面指纹决定：同一盘再次排盘直接复用已有文件。
 * 目录：REPORTS_DIR（生产 /var/lib/orasage/bazi-reports）。
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  composeFreeReport,
  type FreeReport,
  type FreeReportInput,
} from "../shared/free-report.ts";
import { buildReportPageHtml } from "./reportHtml.ts";
import { resolveReportsDir } from "./_core/reportsDir.ts";

const BAZI_PUBLIC_URL = process.env.BAZI_PUBLIC_URL ?? "https://bazi.orasage.com";
const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL ?? "http://127.0.0.1:3101";

export type ChartFingerprintInput = {
  birthStr: string;
  gender: string;
  riZhu: string;
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
  lang: string;
};

/** 模板大版本变化时递增，强制同盘重新物化 HTML（分享卡 / 详情版式） */
export const STATIC_REPORT_TEMPLATE_VERSION = "detail-share-v1";

/** 稳定盘面指纹 → chart_<16hex>，同盘同语言始终同一文件 */
export function chartReportId(input: ChartFingerprintInput): string {
  const raw = [
    input.birthStr.trim(),
    input.gender,
    input.riZhu,
    `${input.year.gan}${input.year.zhi}`,
    `${input.month.gan}${input.month.zhi}`,
    `${input.day.gan}${input.day.zhi}`,
    `${input.hour.gan}${input.hour.zhi}`,
    input.lang.startsWith("zh") ? "zh" : "en",
    STATIC_REPORT_TEMPLATE_VERSION,
  ].join("|");
  const hash = crypto.createHash("sha256").update(raw, "utf8").digest("hex").slice(0, 16);
  return `chart_${hash}`;
}

export function freeReportToMarkdown(free: FreeReport, opts?: { name?: string; birthStr?: string }): string {
  const lines: string[] = [];
  // 日主行 / 四柱说明已在详情页 hero 展示，正文从结构化章节开始
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
  /** 绝对 URL（用户中心 / 邮件） */
  reportUrl: string;
  /** 同域相对路径（前端打开静态页） */
  reportPath: string;
  reused: boolean;
  absolutePath: string;
};

/** 若文件已存在则直接返回 URL；否则生成并写入 REPORTS_DIR */
export function ensureStaticFreeReport(
  resultData: Record<string, unknown>,
  lang = "zh-CN",
): MaterializeResult {
  const input = asFreeInput(resultData);
  if (!input.riZhu || !input.year.gan) {
    throw new Error("invalid chart data for static report");
  }

  const reportId = chartReportId({
    birthStr: String(resultData.birthStr ?? ""),
    gender: String(resultData.gender ?? "male"),
    riZhu: input.riZhu,
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    lang,
  });
  const fileName = `${reportId}.html`;
  const reportsDir = resolveReportsDir();
  const absolutePath = path.join(reportsDir, fileName);
  const reportPath = `/reports/${fileName}`;
  const reportUrl = `${BAZI_PUBLIC_URL.replace(/\/$/, "")}${reportPath}`;

  if (fs.existsSync(absolutePath)) {
    return { reportId, fileName, reportUrl, reportPath, reused: true, absolutePath };
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
  const html = buildReportPageHtml({
    planLabel,
    reportContent: markdown,
    subjectName: input.name || undefined,
    generatedAt: new Date(),
    shareUrl: reportUrl,
    showUpgrade: true,
    upgradeUrl: `${BAZI_PUBLIC_URL.replace(/\/$/, "")}/`,
    locale: lang,
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
    },
  });
  fs.writeFileSync(absolutePath, html, "utf-8");
  return { reportId, fileName, reportUrl, reportPath, reused: false, absolutePath };
}

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

/** 将测试报告 upsert 到 auth user_readings，供后台「测试报告」列表展示 */
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
