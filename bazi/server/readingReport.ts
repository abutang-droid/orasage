/**
 * 每条占卜记录（readingId）对应一份固定报告 HTML。
 * 免费排盘写入 free 层；付费解锁后在同一文件上覆盖为 paid 全文。
 * 详情页与「打开固定报告页」共用这一份内容。
 */

import fs from "fs";
import path from "path";
import { buildReportPageHtml, type ReportChartMeta, type ReportProductRecommend } from "./reportHtml.ts";
import { resolveReportsDir } from "./_core/reportsDir.ts";

const BAZI_PUBLIC_URL = (process.env.BAZI_PUBLIC_URL ?? "https://bazi.orasage.com").replace(/\/$/, "");

export type ReportTier = "free" | "paid";

/** readingId → 安全文件名（不含扩展名） */
export function readingReportFileId(readingId: string): string {
  const raw = readingId.trim();
  if (!raw) throw new Error("readingId required for per-user report");
  const safe = raw
    .replace(/[^a-zA-Z0-9._:-]/g, "_")
    .replace(/:/g, "_")
    .slice(0, 96);
  return `reading_${safe}`;
}

export function resolveReadingReportPaths(readingId: string) {
  const reportId = readingReportFileId(readingId);
  const fileName = `${reportId}.html`;
  const reportsDir = resolveReportsDir();
  const absolutePath = path.join(reportsDir, fileName);
  const reportPath = `/reports/${fileName}`;
  const reportUrl = `${BAZI_PUBLIC_URL}${reportPath}`;
  return { reportId, fileName, reportsDir, absolutePath, reportPath, reportUrl };
}

export function readReportTier(absolutePath: string): ReportTier | null {
  if (!fs.existsSync(absolutePath)) return null;
  const head = fs.readFileSync(absolutePath, "utf8").slice(0, 1200);
  if (/data-report-tier=["']paid["']/.test(head)) return "paid";
  if (/data-report-tier=["']free["']/.test(head)) return "free";
  // 旧文件无标记：按是否含升级区粗判
  if (head.includes("paywall-section") || head.includes("解锁完整命局报告")) return "free";
  return "paid";
}

export type WriteReadingReportOpts = {
  readingId: string;
  tier: ReportTier;
  planLabel: string;
  reportContent: string;
  subjectName?: string;
  locale?: string;
  chart?: ReportChartMeta | null;
  productRecommend?: ReportProductRecommend | null;
  /** 已是 paid 时默认拒绝被 free 覆盖 */
  allowDowngrade?: boolean;
};

export function writeReadingReportHtml(opts: WriteReadingReportOpts) {
  const paths = resolveReadingReportPaths(opts.readingId);
  const existingTier = readReportTier(paths.absolutePath);
  if (existingTier === "paid" && opts.tier === "free" && !opts.allowDowngrade) {
    return { ...paths, reused: true as const, skipped: true as const, tier: "paid" as const };
  }

  const html = buildReportPageHtml({
    planLabel: opts.planLabel,
    reportContent: opts.reportContent,
    subjectName: opts.subjectName,
    generatedAt: new Date(),
    shareUrl: paths.reportUrl,
    showUpgrade: opts.tier === "free",
    upgradeUrl: `${BAZI_PUBLIC_URL}/`,
    locale: opts.locale || "zh-CN",
    chart: opts.chart ?? null,
    productRecommend: opts.productRecommend ?? null,
    tier: opts.tier,
  });
  fs.mkdirSync(paths.reportsDir, { recursive: true });
  fs.writeFileSync(paths.absolutePath, html, "utf-8");
  return { ...paths, reused: false as const, skipped: false as const, tier: opts.tier };
}
