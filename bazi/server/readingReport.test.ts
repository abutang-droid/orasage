import { describe, it, expect } from "vitest";
import { readingReportFileId, resolveReadingReportPaths, maybeRewriteServedReportHtml, rewriteStalePaywallHref } from "./readingReport.ts";

describe("readingReport", () => {
  it("sanitizes readingId into stable file id", () => {
    expect(readingReportFileId("bazi:abc/../x")).toBe("reading_bazi_abc_.._x");
  });

  it("resolveReadingReportPaths uses /reports/reading_*.html", () => {
    const p = resolveReadingReportPaths("session-1");
    expect(p.fileName).toBe("reading_session-1.html");
    expect(p.reportPath).toBe("/reports/reading_session-1.html");
    expect(p.reportUrl).toContain("/reports/reading_session-1.html");
  });

  it("rewrites luopan-home paywall CTA to shop checkout", () => {
    const stale = `<a class="paywall-cta" href="https://bazi.orasage.com/">付费解锁</a>`;
    const out = rewriteStalePaywallHref(stale, "bazi_abc", "zh-CN");
    expect(out).toContain("shop.orasage.com/checkout");
    expect(out).toContain("sku=report-bazi-basic");
    expect(out).not.toContain('href="https://bazi.orasage.com/"');
  });

  it("maybeRewriteServedReportHtml leaves paid pages and shop CTAs alone", () => {
    const paid = `<html data-report-tier="paid"><a class="paywall-cta" href="https://bazi.orasage.com/"></a>`;
    expect(maybeRewriteServedReportHtml("reading_x.html", paid)).toBe(paid);
    const ok = `<html data-report-tier="free"><a class="paywall-cta" href="https://shop.orasage.com/checkout?sku=report-bazi-basic"></a>`;
    expect(maybeRewriteServedReportHtml("reading_x.html", ok)).toBe(ok);
  });
});
