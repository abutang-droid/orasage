import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import {
  chartReportId,
  ensureStaticFreeReport,
  freeReportToMarkdown,
} from "./staticFreeReport.ts";
import { composeFreeReport } from "../shared/free-report.ts";

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

  it("chartReportId is stable for the same chart", () => {
    const a = chartReportId({ ...sample, lang: "zh-CN" });
    const b = chartReportId({ ...sample, lang: "zh-CN" });
    expect(a).toBe(b);
    expect(a).toMatch(/^chart_[a-f0-9]{16}$/);
  });

  it("chartReportId changes when pillars change", () => {
    const a = chartReportId({ ...sample, lang: "zh-CN" });
    const b = chartReportId({
      ...sample,
      hour: { gan: "己", zhi: "巳" },
      lang: "zh-CN",
    });
    expect(a).not.toBe(b);
  });

  it("freeReportToMarkdown emits ### chapters", () => {
    const free = composeFreeReport(sample, "zh-CN");
    const md = freeReportToMarkdown(free, { name: "测试", birthStr: sample.birthStr });
    expect(md).toContain("### ");
    expect(md.split("### ").length).toBeGreaterThan(3);
  });

  it("ensureStaticFreeReport writes then reuses", () => {
    const first = ensureStaticFreeReport(sample, "zh-CN");
    expect(first.reused).toBe(false);
    expect(fs.existsSync(first.absolutePath)).toBe(true);
    const html = fs.readFileSync(first.absolutePath, "utf-8");
    expect(html).toContain("OraSage");
    expect(html).toContain("#C96442");

    const second = ensureStaticFreeReport(sample, "zh-CN");
    expect(second.reused).toBe(true);
    expect(second.fileName).toBe(first.fileName);
    expect(second.reportUrl).toBe(first.reportUrl);
    expect(second.reportPath).toBe(`/reports/${first.fileName}`);
  });
});
