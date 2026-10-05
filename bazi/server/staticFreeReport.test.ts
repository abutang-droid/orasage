import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  ensureStaticFreeReport,
  freeReportToMarkdown,
  writePaidReadingReport,
} from "./staticFreeReport.ts";
import { composeFreeReport } from "../shared/free-report.ts";
import { readingReportFileId, readReportTier, buildUnlockCheckoutUrl } from "./readingReport.ts";

const sample = {
  name: "测试",
  gender: "male",
  birthStr: "1990-05-15 08:00",
  riZhu: "甲",
  strength: "身弱",
  favorable: ["水", "木"],
  unfavorable: ["金"],
  year: { gan: "庚", zhi: "午" },
  month: { gan: "辛", zhi: "巳" },
  day: { gan: "甲", zhi: "子" },
  hour: { gan: "戊", zhi: "辰" },
  wuXing: { 木: 3, 火: 2, 土: 2, 金: 1, 水: 1 },
  shiShen: { 庚: "正财", 辛: "偏财", 甲: "比肩", 戊: "偏印" },
  pattern: { primary: "食神格" },
};

describe("staticFreeReport", () => {
  let tmpDir: string;
  let prevReportsDir: string | undefined;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bazi-reports-"));
    prevReportsDir = process.env.REPORTS_DIR;
    process.env.REPORTS_DIR = tmpDir;
  });

  afterEach(() => {
    if (prevReportsDir === undefined) delete process.env.REPORTS_DIR;
    else process.env.REPORTS_DIR = prevReportsDir;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("readingReportFileId is unique per readingId", () => {
    expect(readingReportFileId("bazi_aaa")).not.toBe(readingReportFileId("bazi_bbb"));
    expect(readingReportFileId("bazi_aaa")).toMatch(/^reading_/);
  });

  it("freeReportToMarkdown emits ### chapters", () => {
    const free = composeFreeReport(sample, "zh-CN");
    const md = freeReportToMarkdown(free, { name: "测试", birthStr: sample.birthStr });
    expect(md).toContain("### ");
    expect(md.split("### ").length).toBeGreaterThan(3);
  });

  it("same chart different readingIds write separate files", () => {
    const a = ensureStaticFreeReport(sample, "zh-CN", { readingId: "user-a-1" });
    const b = ensureStaticFreeReport(sample, "zh-CN", { readingId: "user-b-1" });
    expect(a.fileName).not.toBe(b.fileName);
    expect(a.reportUrl).not.toBe(b.reportUrl);
    expect(fs.existsSync(a.absolutePath)).toBe(true);
    expect(fs.existsSync(b.absolutePath)).toBe(true);
    expect(a.fileName).toMatch(/^reading_/);
    expect(readReportTier(a.absolutePath)).toBe("free");
    const html = fs.readFileSync(a.absolutePath, "utf-8");
    expect(html).toContain("mingpan-board");
    expect(html).toContain("wx-radar");
    expect(html).toContain("elements-donut");
    expect(html).toContain("你的结构速览");
    expect(html).not.toContain("你的命局解读");
    expect(html).not.toContain('class="weekly-timeline"');
    expect(html).toContain("shop.orasage.com/checkout");
    expect(html).toContain("sku=report-bazi-basic");
    expect(html).toContain("付费解锁详细解读");
    expect(html).not.toMatch(/paywall-cta"[^>]*href="https:\/\/bazi\.orasage\.com\/?"/);
    expect(html).not.toContain("2026：机会变多");
  });

  it("buildUnlockCheckoutUrl returns shop checkout, not luopan home", () => {
    const url = buildUnlockCheckoutUrl("user-a-1", "zh-CN");
    expect(url).toContain("https://shop.orasage.com/checkout?");
    expect(url).toContain("sku=report-bazi-basic");
    expect(url).toContain("readingId=user-a-1");
    expect(url).toContain("planType=basic");
    expect(decodeURIComponent(url)).toContain("/classic?paid=1");
    expect(url).not.toMatch(/return=https%3A%2F%2Fbazi\.orasage\.com%2F(?!classic)/);
  });

  it("requires readingId", () => {
    expect(() => ensureStaticFreeReport(sample, "zh-CN")).toThrow(/readingId/);
  });

  it("paid overwrite keeps same path and upgrades tier", () => {
    const free = ensureStaticFreeReport(sample, "zh-CN", { readingId: "pay-1" });
    expect(readReportTier(free.absolutePath)).toBe("free");
    const htmlFree = fs.readFileSync(free.absolutePath, "utf-8");
    expect(htmlFree).toContain("data-report-tier=\"free\"");

    const paid = writePaidReadingReport({
      readingId: "pay-1",
      reportContent: "### 深度解读\n\n付费全文内容。",
      planLabel: "深度解读",
      resultData: sample,
    });
    expect(paid.fileName).toBe(free.fileName);
    expect(paid.reportUrl).toBe(free.reportUrl);
    expect(readReportTier(paid.absolutePath)).toBe("paid");
    const htmlPaid = fs.readFileSync(paid.absolutePath, "utf-8");
    expect(htmlPaid).toContain("付费全文内容");
    expect(htmlPaid).toContain("data-report-tier=\"paid\"");

    const again = ensureStaticFreeReport(sample, "zh-CN", { readingId: "pay-1" });
    expect(again.reused).toBe(true);
    expect(readReportTier(again.absolutePath)).toBe("paid");
    expect(fs.readFileSync(again.absolutePath, "utf-8")).toContain("付费全文内容");
  });

  it("re-entry reuses the same free html without rewriting", () => {
    const first = ensureStaticFreeReport(sample, "zh-CN", { readingId: "reentry-1" });
    expect(first.reused).toBe(false);
    fs.appendFileSync(first.absolutePath, "<!--keep-->");
    const second = ensureStaticFreeReport(sample, "zh-CN", { readingId: "reentry-1" });
    expect(second.reused).toBe(true);
    expect(second.fileName).toBe(first.fileName);
    expect(fs.readFileSync(second.absolutePath, "utf-8")).toContain("<!--keep-->");
  });

  it("force=true rewrites an existing free html", () => {
    const first = ensureStaticFreeReport(sample, "zh-CN", { readingId: "force-1" });
    fs.appendFileSync(first.absolutePath, "<!--stale-->");
    const second = ensureStaticFreeReport(sample, "zh-CN", { readingId: "force-1", force: true });
    expect(second.reused).toBe(false);
    expect(fs.readFileSync(second.absolutePath, "utf-8")).not.toContain("<!--stale-->");
    expect(fs.readFileSync(second.absolutePath, "utf-8")).toContain("report-longform");
  });

  it("rewrites an old luopan-home paywall CTA on re-materialize", () => {
    const first = ensureStaticFreeReport(sample, "zh-CN", { readingId: "stale-cta-1" });
    const stale = fs.readFileSync(first.absolutePath, "utf-8")
      .replace(/class="paywall-cta" href="[^"]*"/, 'class="paywall-cta" href="https://bazi.orasage.com/"');
    fs.writeFileSync(first.absolutePath, stale, "utf-8");
    const second = ensureStaticFreeReport(sample, "zh-CN", { readingId: "stale-cta-1" });
    expect(second.reused).toBe(false);
    const html = fs.readFileSync(second.absolutePath, "utf-8");
    expect(html).toContain("shop.orasage.com/checkout");
    expect(html).not.toMatch(/paywall-cta" href="https:\/\/bazi\.orasage\.com\/"/);
  });

  it("regenerates old detailed free html into a brief preview", () => {
    const first = ensureStaticFreeReport(sample, "zh-CN", { readingId: "stale-detail-1" });
    const detailed = fs.readFileSync(first.absolutePath, "utf-8")
      .replaceAll("你的结构速览", "你的命局解读")
      .replace("</main>", '<div class="weekly-timeline"></div></main>');
    fs.writeFileSync(first.absolutePath, detailed, "utf-8");
    const second = ensureStaticFreeReport(sample, "zh-CN", { readingId: "stale-detail-1" });
    expect(second.reused).toBe(false);
    const html = fs.readFileSync(second.absolutePath, "utf-8");
    expect(html).toContain("你的结构速览");
    expect(html).not.toContain("你的命局解读");
    expect(html).not.toContain('class="weekly-timeline"');
    expect(html).toContain("shop.orasage.com/checkout");
  });

  it("uses injected AI reportContent instead of the local template body", () => {
    const marker = "NETWORK-AI-BRIEF-UNIQUE-SENTENCE";
    const written = ensureStaticFreeReport(sample, "zh-CN", {
      readingId: "ai-brief-1",
      reportContent: `### 这套配置在说什么\n\n${marker}\n`,
    });
    const html = fs.readFileSync(written.absolutePath, "utf-8");
    expect(html).toContain(marker);
    expect(html).toContain("你的结构速览");
    expect(html).toContain("sku=report-bazi-basic");
    expect(html).not.toContain("2026：机会变多");
  });
});
