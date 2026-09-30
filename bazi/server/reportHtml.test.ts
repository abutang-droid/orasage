import { describe, it, expect } from "vitest";
import { renderMarkdown, buildReportPageHtml } from "./reportHtml.ts";

describe("renderMarkdown", () => {
  it("escapes raw HTML", () => {
    const input = '<script>alert("xss")</script>';
    const out = renderMarkdown(input);
    expect(out).toContain("&lt;script&gt;");
    expect(out).not.toContain("<script>");
  });

  it("converts ### to h3", () => {
    expect(renderMarkdown("### 命盘总览")).toContain("<h3>命盘总览</h3>");
  });

  it("converts ## to h2", () => {
    expect(renderMarkdown("## 报告结构")).toContain("<h2>报告结构</h2>");
  });

  it("converts **bold** to <strong>", () => {
    const out = renderMarkdown("这是 **重要** 内容");
    expect(out).toContain("<strong>重要</strong>");
  });

  it("wraps consecutive - items in <ul>", () => {
    const input = "- 第一项\n- 第二项";
    const out = renderMarkdown(input);
    expect(out).toContain("<ul><li>第一项</li><li>第二项</li></ul>");
  });

  it("wraps paragraphs in <p>", () => {
    const input = "第一段\n\n第二段";
    const out = renderMarkdown(input);
    const ps = (out.match(/<p>/g) || []).length;
    expect(ps).toBeGreaterThanOrEqual(2);
  });

  it("does not double-wrap block elements in <p>", () => {
    const input = "### 标题\n\n段落内容";
    const out = renderMarkdown(input);
    // h3 should not be inside a <p>
    expect(out).not.toMatch(/<p>\s*<h3/);
  });

  it("handles Chinese LLM output with inline data", () => {
    const input = `### 命盘总览
综合四层分析：日主**身强**，格局**正印格**。

### 性格与天赋
格局+调候解释性格。

- 优势一
- 优势二`;
    const out = renderMarkdown(input);
    expect(out).toContain("<h3>命盘总览</h3>");
    expect(out).toContain("<strong>身强</strong>");
    expect(out).toContain("<strong>正印格</strong>");
    expect(out).toContain("<li>优势一</li>");
    expect(out).toContain("<li>优势二</li>");
  });

  it("buildReportPageHtml renders magazine detail layout with keywords", () => {
    const html = buildReportPageHtml({
      planLabel: "深度解读",
      reportContent: `### 命盘总览
算法依据：日主乙木，生于卯月，身强。

### 性格与天赋
格局正印格，聪慧稳重。`,
      subjectName: "张三",
      shareUrl: "https://bazi.orasage.com/reports/demo.html",
      showUpgrade: true,
      chart: {
        riZhu: "乙",
        strength: "身强",
        dayMasterLine: "代表你的字：乙（木）　·　身强",
        year: { gan: "庚", zhi: "午" },
        wuXing: { 木: 3, 火: 2, 土: 2, 金: 1, 水: 1 },
      },
    });
    expect(html).toContain("你的命局解读");
    expect(html).toContain("命盘总览");
    expect(html).toContain("key-takeaway");
    expect(html).not.toContain("算法依据");
    expect(html).toContain("Orasage");
    expect(html).toContain("share-card");
    expect(html).toContain("data-share-open");
    expect(html).toContain("og:title");
    expect(html).toContain("五行分布");
    expect(html).toContain("elements-donut");
    expect(html).toContain("balance-gauge");
    expect(html).toContain("weekly-timeline");
    expect(html).toContain("core-insight-body");
    expect(html).toContain("解锁完整命局报告");
  });

  it("buildReportPageHtml renders single admin product recommend", () => {
    const html = buildReportPageHtml({
      planLabel: "深度解读",
      reportContent: "### 开运建议\n佩戴水晶。",
      productRecommend: {
        name: "绿幽灵手串",
        desc: "补木",
        priceDisplay: "$88.00",
        shopUrl: "https://shop.orasage.com/checkout?sku=crystal-wood",
      },
    });
    expect(html).toContain("绿幽灵手串");
    expect(html).toContain("$88.00");
    expect((html.match(/class="product-rec"/g) || []).length).toBe(1);
  });

  it("buildReportPageHtml embeds share caption with report URL", () => {
    const html = buildReportPageHtml({
      planLabel: "结构速览",
      reportContent: "### 开篇\n身强用食伤。",
      subjectName: "李四",
      shareUrl: "https://bazi.orasage.com/reports/chart_abc.html",
      chart: { dayMasterLine: "代表你的字：甲（木）　·　身强" },
    });
    expect(html).toContain("https://bazi.orasage.com/reports/chart_abc.html");
    expect(html).toContain("分享我的八字速览");
    expect(html).toContain("shareWeibo");
    expect(html).toContain("shareWechat");
  });
});
