import { describe, it, expect } from "vitest";
import { readingReportFileId, resolveReadingReportPaths, maybeRewriteServedReportHtml, rewriteStalePaywallHref, briefifyStaleFreeReportHtml, buildUnlockCheckoutUrl } from "./readingReport.ts";

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

  it("maybeRewriteServedReportHtml leaves paid pages alone and upgrades shop CTAs missing locale", () => {
    const paid = `<html data-report-tier="paid"><a class="paywall-cta" href="https://bazi.orasage.com/"></a>`;
    expect(maybeRewriteServedReportHtml("reading_x.html", paid)).toBe(paid);
    const missingLocale = `<html data-report-tier="free"><a class="paywall-cta" href="https://shop.orasage.com/checkout?sku=report-bazi-basic"></a>`;
    const upgraded = maybeRewriteServedReportHtml("reading_x.html", missingLocale);
    expect(upgraded).toContain("locale=zh-CN");
    expect(upgraded).toContain("lang=zh-CN");
    const withLocale = `<html data-report-tier="free"><a class="paywall-cta" href="https://shop.orasage.com/checkout?sku=report-bazi-basic&amp;locale=zh-CN&amp;lang=zh-CN"></a>`;
    expect(maybeRewriteServedReportHtml("reading_x.html", withLocale)).toBe(withLocale);
  });

  it("briefifies stale detailed free html even when the CTA already points at shop", () => {
    const stale = `<!doctype html><html data-report-tier="free">
<ul class="toc-list">
<li class="toc-item active" data-section="section-01"><a href="#section-01"><span class="toc-num">01</span>开篇</a></li>
<li class="toc-item" data-section="section-05"><a href="#section-05"><span class="toc-num">05</span>行动建议</a></li>
</ul>
<main>
<section class="section" id="section-01" data-toc="开篇"><h2 class="section-title">开篇</h2><p>简版该留</p></section>
<section class="section section-mingpan" id="section-02" data-toc="四柱命盘"><h2 class="section-title">四柱命盘</h2></section>
<section class="section section-elements" id="section-03" data-toc="五行分布"><h2 class="section-title">五行分布</h2></section>
<section class="section" id="section-04" data-toc="这套配置的主要结构"><h2 class="section-title">这套配置的主要结构</h2></section>
<section class="section" id="section-extra" data-toc="2026：机会变多"><h2 class="section-title">2026：机会变多</h2></section>
<section class="section" id="section-07" data-toc="方向提示"><h2 class="section-title">方向提示</h2></section>
<section class="section" id="section-08" data-toc="方向提示"><h2 class="section-title">方向提示</h2></section>
<section class="section section-weekly" id="section-05" data-toc="行动建议"><h2 class="section-title">本周行动建议</h2><div class="weekly-timeline"></div></section>
</main>
<h1 class="hero-headline">你的命局解读</h1>
<a class="paywall-cta" href="https://shop.orasage.com/checkout?sku=report-bazi-basic">付费解锁详细解读</a>`;
    const out = maybeRewriteServedReportHtml("reading_x.html", stale);
    expect(out).toContain("你的结构速览");
    expect(out).not.toContain("你的命局解读");
    expect(out).not.toContain('class="weekly-timeline"');
    expect(out).not.toContain("2026：机会变多");
    expect(out).toContain("核心洞察");
    expect(out).toContain("简版该留");
    expect(out).toContain('data-brief-layout="v4"');
    expect(out).toContain('data-brief-skin="ochre"');
    expect(out).toContain("#c96442");
    expect(out).toContain("shop.orasage.com/checkout");
    expect(briefifyStaleFreeReportHtml(stale)).toContain("你的结构速览");
  });

  it("unlock checkout URL carries locale for Chinese reports", () => {
    const url = buildUnlockCheckoutUrl("bazi_abc", "zh-CN");
    expect(url).toContain("locale=zh-CN");
    expect(url).toContain("lang=zh-CN");
    expect(url).toContain("sku=report-bazi-basic");
  });

  it("maybeRewriteServedReportHtml injects locale into shop CTAs that lack it", () => {
    const stale = `<html data-report-tier="free"><a class="paywall-cta" href="https://shop.orasage.com/checkout?sku=report-bazi-basic&amp;appSource=bazi">付费解锁</a>`;
    const out = maybeRewriteServedReportHtml("reading_bazi_abc.html", stale, "zh-CN");
    expect(out).toContain("locale=zh-CN");
    expect(out).toContain("lang=zh-CN");
  });

});
