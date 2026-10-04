/**
 * Rewrite legacy report_/chart_ Bazi HTML into the latest magazine reading_ files.
 *
 * Sole write pipeline:
 *   ensureStaticFreeReport / writePaidReadingReport
 *     -> writeReadingReportHtml -> buildReportPageHtml
 *
 * Usage on VPS:
 *   REPORTS_DIR=/var/lib/orasage/bazi-reports \
 *   AUTH_DATABASE_URL=postgresql://.../orasage_auth \
 *   BAZI_PUBLIC_URL=https://bazi.orasage.com \
 *   npx tsx scripts/rewrite-reports-latest.ts [--dry-run] [--prune]
 */

import fs from "fs";
import path from "path";
import postgres from "postgres";
import {
  ensureStaticFreeReport,
  writePaidReadingReport,
  patchReadingReportUrl,
} from "../server/staticFreeReport.ts";
import { readingReportFileId } from "../server/readingReport.ts";

const REPORTS_DIR = process.env.REPORTS_DIR || path.resolve("dist/public/reports");
const AUTH_DATABASE_URL =
  process.env.AUTH_DATABASE_URL ||
  process.env.DATABASE_URL_AUTH ||
  "";
const DRY = process.argv.includes("--dry-run");
const PRUNE = process.argv.includes("--prune");
const FORCE = process.argv.includes("--force");
const PUBLIC = (process.env.BAZI_PUBLIC_URL || "https://bazi.orasage.com").replace(/\/$/, "");

type ReadingRow = {
  id: number;
  reading_id: string;
  report_url: string | null;
  title: string;
  payload_json: string | null;
};

function extractMarkdownFromLegacyHtml(html: string): string | null {
  const sectionRe =
    /<h2 class="section-title">([\s\S]*?)<\/h2>[\s\S]*?(?:<div class="(?:core-insight-body|section-body|personality-text)">([\s\S]*?)<\/div>|<div class="key-takeaway")/g;
  const parts: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(html))) {
    const title = m[1].replace(/<[^>]+>/g, "").trim();
    if (!title || /行动建议|本周|方向提示|五行分布|四柱命盘/.test(title)) continue;
    const bodyHtml = m[2] || "";
    const body = bodyHtml
      .replace(/<\/p>/g, "\n\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<li>/g, "- ")
      .replace(/<\/li>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (body) parts.push(`### ${title}\n\n${body}\n`);
  }
  if (parts.length >= 1) return parts.join("\n");

  const wrap = html.match(/<div class="(?:card|content|body|wrap)[^"]*">([\s\S]{80,}?)<\/div>/);
  if (wrap) {
    const text = wrap[1]
      .replace(/<\/p>/g, "\n\n")
      .replace(/<h[1-3][^>]*>/g, "\n### ")
      .replace(/<\/h[1-3]>/g, "\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .trim();
    if (text.length > 80) return text.startsWith("###") ? text : `### 命盘总览\n\n${text}\n`;
  }
  return null;
}

function isPaidHtml(html: string): boolean {
  if (/data-report-tier=["']paid["']/.test(html)) return true;
  if (/data-report-tier=["']free["']/.test(html)) return false;
  if (html.includes("paywall-section") || html.includes("解锁完整命局报告")) return false;
  return html.length > 40000 || html.includes("十年大运");
}

function parseResultData(payloadJson: string | null): Record<string, unknown> | null {
  if (!payloadJson?.trim()) return null;
  try {
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    if (payload.resultData && typeof payload.resultData === "object") {
      return payload.resultData as Record<string, unknown>;
    }
    if (payload.year) return payload;
    return null;
  } catch {
    return null;
  }
}

function legacyFileFromUrl(reportUrl: string | null): string | null {
  if (!reportUrl) return null;
  const m = reportUrl.match(/\/reports\/([^/?#]+\.html)/);
  if (!m) return null;
  return path.join(REPORTS_DIR, m[1]);
}

function hasLatestGraphics(html: string): boolean {
  return (
    html.includes("mingpan-board") &&
    html.includes("wx-radar") &&
    html.includes("elements-donut") &&
    html.includes("brand-lockup") &&
    (html.includes("海棠未眠") || html.includes("OraSage"))
  );
}

function isStaleDetailedFree(html: string): boolean {
  if (isPaidHtml(html)) return false;
  return html.includes("你的命局解读") || html.includes('class="weekly-timeline"');
}

async function rewriteOne(row: ReadingRow): Promise<{ status: string; url?: string }> {
  const resultData = parseResultData(row.payload_json);
  if (!resultData) return { status: "skip-no-payload", url: row.report_url || undefined };

  let lang = "zh-CN";
  try {
    const p = JSON.parse(row.payload_json || "{}") as { lang?: string };
    if (p.lang) lang = p.lang;
  } catch {
    /* ignore */
  }

  const readingId = row.reading_id?.trim();
  if (!readingId) return { status: "skip-no-reading-id", url: row.report_url || undefined };

  const legacyPath = legacyFileFromUrl(row.report_url);
  let legacyHtml = "";
  if (legacyPath && fs.existsSync(legacyPath)) {
    legacyHtml = fs.readFileSync(legacyPath, "utf-8");
  }

  const targetId = readingReportFileId(readingId);
  const targetPath = path.join(REPORTS_DIR, `${targetId}.html`);
  const reportUrl = `${PUBLIC}/reports/${targetId}.html`;

  if (fs.existsSync(targetPath)) {
    const existing = fs.readFileSync(targetPath, "utf-8");
    if (!FORCE && hasLatestGraphics(existing) && !isStaleDetailedFree(existing)) {
      // 已是最新简版：仍确保 DB 指向 reading_* URL
      if (!DRY && row.report_url !== reportUrl) {
        await patchReadingReportUrl(readingId, reportUrl, row.title);
      }
      return { status: row.report_url === reportUrl ? "ok-latest" : "ok-relink", url: reportUrl };
    }
  }

  if (DRY) {
    return { status: "dry-rewrite", url: reportUrl };
  }

  const staleOnDisk =
    fs.existsSync(targetPath) && isStaleDetailedFree(fs.readFileSync(targetPath, "utf-8"));
  const free = ensureStaticFreeReport(resultData, lang, {
    readingId,
    skipIfPaid: !FORCE,
    force: FORCE || staleOnDisk,
  });

  if (legacyHtml && isPaidHtml(legacyHtml)) {
    const md = extractMarkdownFromLegacyHtml(legacyHtml);
    if (md && md.length > 40) {
      writePaidReadingReport({
        readingId,
        reportContent: md,
        planLabel: "深度解读",
        subjectName: String(resultData.name || ""),
        locale: lang,
        resultData,
      });
    }
  }

  const finalHtml = fs.readFileSync(free.absolutePath, "utf-8");
  if (!hasLatestGraphics(finalHtml)) {
    throw new Error(`rewrite missing graphics: ${free.fileName}`);
  }

  await patchReadingReportUrl(readingId, free.reportUrl, row.title);
  return { status: "rewritten", url: free.reportUrl };
}

function pruneOrphans(keepUrls: Set<string>) {
  const keepFiles = new Set(
    [...keepUrls]
      .map((u) => u.match(/\/reports\/([^/?#]+\.html)/)?.[1])
      .filter(Boolean) as string[],
  );
  const files = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".html"));
  const removed: string[] = [];
  for (const f of files) {
    if (keepFiles.has(f)) continue;
    if (/^(report_|chart_|reading_)/.test(f)) {
      if (!DRY) fs.unlinkSync(path.join(REPORTS_DIR, f));
      removed.push(f);
    }
  }
  return removed;
}

async function main() {
  if (!AUTH_DATABASE_URL) {
    throw new Error("AUTH_DATABASE_URL required (orasage_auth)");
  }
  process.env.REPORTS_DIR = REPORTS_DIR;
  process.env.BAZI_PUBLIC_URL = PUBLIC;
  console.log(`[rewrite] REPORTS_DIR=${REPORTS_DIR} dry=${DRY} prune=${PRUNE} force=${FORCE}`);
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const sql = postgres(AUTH_DATABASE_URL, { max: 1 });
  const rows = await sql<ReadingRow[]>`
    SELECT id, reading_id, report_url, title, payload_json
    FROM user_readings
    WHERE app_source = 'bazi'
    ORDER BY id ASC
  `;
  console.log(`[rewrite] bazi readings=${rows.length}`);

  const keep = new Set<string>();
  const summary: Record<string, number> = {};
  for (const row of rows) {
    try {
      const r = await rewriteOne(row);
      summary[r.status] = (summary[r.status] || 0) + 1;
      if (r.url) keep.add(r.url);
      console.log(`[rewrite] #${row.id} ${row.reading_id} → ${r.status}${r.url ? " " + r.url : ""}`);
    } catch (e) {
      summary.error = (summary.error || 0) + 1;
      console.error(`[rewrite] #${row.id} FAIL`, e);
      if (row.report_url) keep.add(row.report_url);
    }
  }

  await sql.end({ timeout: 5 });

  if (PRUNE) {
    const removed = pruneOrphans(keep);
    console.log(`[rewrite] pruned=${removed.length}`, removed.slice(0, 30));
    summary.pruned = removed.length;
  }

  console.log("[rewrite] done", summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
