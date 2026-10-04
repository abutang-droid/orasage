/**
 * 每条占卜记录（readingId）对应一份固定报告 HTML —— 全站唯一静态报告文件名约定。
 * 免费排盘写入 free 层；付费解锁后在同一文件上覆盖为 paid 全文。
 * 详情页 / iframe / 用户中心 / 分享链接 全部指向这一份（reading_*.html）。
 * 不再生成 report_* 或 chart_*。
 */

import fs from "fs";
import path from "path";
import { buildReportPageHtml, type ReportChartMeta, type ReportProductRecommend } from "./reportHtml.ts";
import { resolveReportsDir } from "./_core/reportsDir.ts";

const BAZI_PUBLIC_URL = (process.env.BAZI_PUBLIC_URL ?? "https://bazi.orasage.com").replace(/\/$/, "");
const SHOP_PUBLIC_URL = (process.env.SHOP_PUBLIC_URL ?? "https://shop.orasage.com").replace(/\/$/, "");
/** 静态简版 CTA：只解锁详细解读（数字报告），不绑水晶发货。 */
const BAZI_UNLOCK_SKU = "report-bazi-basic";

/** 简版报告「付费解锁」→ shop 结账，支付成功回 classic 生成详版，禁止链回罗盘首页。 */
export function buildUnlockCheckoutUrl(readingId: string, locale = "zh-CN"): string {
  const lang = locale.startsWith("zh") ? "zh-CN" : locale === "pt-BR" ? "pt-BR" : "en";
  const returnUrl = `${BAZI_PUBLIC_URL}/classic?paid=1&restore=1&lang=${encodeURIComponent(lang)}&readingId=${encodeURIComponent(readingId)}`;
  const qs = new URLSearchParams({
    sku: BAZI_UNLOCK_SKU,
    return: returnUrl,
    appSource: "bazi",
    planType: "basic",
    readingId,
    context: locale.startsWith("zh") ? "八字深度解读" : "Bazi full reading",
  });
  return `${SHOP_PUBLIC_URL}/checkout?${qs.toString()}`;
}

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
  /** 已有文件也重写（迁移脚本）；默认跳过，避免用户再次进入时重新生成 */
  force?: boolean;
};

export function rewriteStalePaywallHref(html: string, readingId: string, locale = "zh-CN"): string {
  const href = buildUnlockCheckoutUrl(readingId, locale)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
  return html.replace(
    /(<a class="paywall-cta" href=")[^"]*(")/,
    `$1${href}$2`,
  );
}

const STRUCTURAL_TOC = /四柱命盘|Four Pillars|五行分布|Elements|方向提示|Direction/;
const WEEKLY_TOC = /行动建议|Actions|本周/;

function sectionToc(block: string): string {
  return (block.match(/data-toc="([^"]*)"/) || [])[1] || "";
}

function isWeeklySection(block: string): boolean {
  const head = block.slice(0, 900);
  return (
    head.includes("section-weekly") ||
    head.includes('class="weekly-timeline"') ||
    WEEKLY_TOC.test(sectionToc(block))
  );
}

function isStructuralSection(block: string): boolean {
  const head = block.slice(0, 500);
  return (
    head.includes("section-mingpan") ||
    head.includes("section-elements") ||
    STRUCTURAL_TOC.test(sectionToc(block))
  );
}

function rebuildToc(sections: string[]): string {
  const items: string[] = [];
  let n = 0;
  for (const block of sections) {
    const id = (block.match(/id="(section-[^"]+)"/) || [])[1];
    const toc = sectionToc(block);
    if (!id || !toc) continue;
    n += 1;
    const num = String(n).padStart(2, "0");
    const active = n === 1 ? " active" : "";
    items.push(
      `<li class="toc-item${active}" data-section="${id}"><a href="#${id}"><span class="toc-num">${num}</span>${toc}</a></li>`,
    );
  }
  return items.join("\n");
}

/**
 * 旧免费页曾按详版排版（标题「你的命局解读」+ 周运 + 额外章节）。
 * 打开时裁成与现网简版一致：两条叙述 + 命盘/五行 + 一条方向提示。
 */
export function briefifyStaleFreeReportHtml(html: string): string {
  const head = html.slice(0, 1600);
  if (/data-report-tier=["']paid["']/.test(head)) return html;
  const stale =
    html.includes("你的命局解读") ||
    html.includes("Your Bazi Reading") ||
    html.includes('class="weekly-timeline"');
  if (!stale) return html;

  let out = html
    .replaceAll("你的命局解读", "你的结构速览")
    .replaceAll("Your Bazi Reading", "Your chart brief");

  const mainMatch = out.match(/<main>([\s\S]*?)<\/main>/);
  if (!mainMatch) return out;

  const chunks = mainMatch[1].split(/(?=<section\b)/);
  const kept: string[] = [];
  let narratives = 0;
  let keptDirection = false;
  for (const chunk of chunks) {
    if (!chunk.trim()) {
      kept.push(chunk);
      continue;
    }
    if (!chunk.startsWith("<section")) {
      kept.push(chunk);
      continue;
    }
    if (isWeeklySection(chunk)) continue;
    const toc = sectionToc(chunk);
    if (/方向提示|Direction/.test(toc)) {
      if (keptDirection) continue;
      keptDirection = true;
      kept.push(chunk);
      continue;
    }
    if (isStructuralSection(chunk)) {
      kept.push(chunk);
      continue;
    }
    narratives += 1;
    if (narratives <= 2) kept.push(chunk);
  }

  out = out.replace(mainMatch[1], kept.join(""));
  const tocHtml = rebuildToc(kept.filter((c) => c.startsWith("<section")));
  if (tocHtml) {
    out = out.replace(/<ul class="toc-list">[\s\S]*?<\/ul>/, `<ul class="toc-list">${tocHtml}</ul>`);
  }
  return out;
}

/** 旧免费页：详版正文裁成简版；CTA 曾指向罗盘首页时改写到 shop checkout。 */
export function maybeRewriteServedReportHtml(fileName: string, html: string): string {
  const head = html.slice(0, 1600);
  if (/data-report-tier=["']paid["']/.test(head)) return html;
  let out = briefifyStaleFreeReportHtml(html);
  if (!out.includes("paywall-cta")) return out;
  if (/shop\.orasage\.com\/checkout/.test(out)) return out;
  const stem = fileName.replace(/^reading_/, "").replace(/\.html$/i, "");
  if (!stem) return out;
  return rewriteStalePaywallHref(out, stem);
}

export function writeReadingReportHtml(opts: WriteReadingReportOpts) {
  const paths = resolveReadingReportPaths(opts.readingId);
  const exists = fs.existsSync(paths.absolutePath);
  const existingTier = exists ? readReportTier(paths.absolutePath) : null;
  if (existingTier === "paid" && opts.tier === "free" && !opts.allowDowngrade) {
    return { ...paths, reused: true as const, skipped: true as const, tier: "paid" as const };
  }
  if (exists && opts.tier === "free" && !opts.force) {
    const existingHtml = fs.readFileSync(paths.absolutePath, "utf8");
    const staleDetailedFree =
      existingHtml.includes("你的命局解读") || existingHtml.includes('class="weekly-timeline"');
    if (!staleDetailedFree) {
      if (!/shop\.orasage\.com\/checkout/.test(existingHtml) && existingHtml.includes("paywall-cta")) {
        fs.writeFileSync(
          paths.absolutePath,
          rewriteStalePaywallHref(existingHtml, opts.readingId, opts.locale || "zh-CN"),
          "utf-8",
        );
        return { ...paths, reused: false as const, skipped: false as const, tier: "free" as const };
      }
      return {
        ...paths,
        reused: true as const,
        skipped: true as const,
        tier: (existingTier ?? "free") as ReportTier,
      };
    }
  }

  const html = buildReportPageHtml({
    planLabel: opts.planLabel,
    reportContent: opts.reportContent,
    subjectName: opts.subjectName,
    generatedAt: new Date(),
    shareUrl: paths.reportUrl,
    showUpgrade: opts.tier === "free",
    upgradeUrl: opts.tier === "free" ? buildUnlockCheckoutUrl(opts.readingId, opts.locale || "zh-CN") : undefined,
    locale: opts.locale || "zh-CN",
    readingId: opts.readingId,
    chart: opts.chart ?? null,
    productRecommend: opts.productRecommend ?? null,
    tier: opts.tier,
  });
  fs.mkdirSync(paths.reportsDir, { recursive: true });
  fs.writeFileSync(paths.absolutePath, html, "utf-8");
  return { ...paths, reused: false as const, skipped: false as const, tier: opts.tier };
}
