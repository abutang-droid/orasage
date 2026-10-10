import { describe, it, expect } from "vitest";
import { renderMarkdown, buildReportPageHtml, condenseBriefCopy, relayoutFreeBriefHtml } from "./reportHtml.ts";

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

  it("free magazine page is a brief preview with shop unlock, not luopan home", () => {
    const html = buildReportPageHtml({
      planLabel: "结构速览",
      reportContent: `### 命盘总览
算法依据：日主乙木，生于卯月，身强。

### 性格与天赋
格局正印格，聪慧稳重。

### 2026：机会变多，注意力变散
流年细拆不应出现在免费页。`,
      subjectName: "张三",
      shareUrl: "https://bazi.orasage.com/reports/demo.html",
      showUpgrade: true,
      tier: "free",
      chart: {
        riZhu: "乙",
        strength: "身强",
        dayMasterLine: "代表你的字：乙（木）　·　身强",
        year: { gan: "庚", zhi: "午" },
        month: { gan: "己", zhi: "卯" },
        day: { gan: "乙", zhi: "亥" },
        hour: { gan: "丙", zhi: "子" },
        wuXing: { 木: 3, 火: 2, 土: 2, 金: 1, 水: 1 },
        favorable: ["水", "木"],
        unfavorable: ["火"],
      },
    });
    expect(html).toContain("你的结构速览");
    expect(html).not.toContain("你的命局解读");
    expect(html).toContain('data-report-tier="free"');
    expect(html).toContain('data-brief-layout="v4"');
    expect(html).toContain('data-brief-skin="ochre"');
    expect(html).toContain("#c96442");
    expect(html).toContain('class="report-longform brief-vibe"');
    expect(html).not.toContain("算法依据");
    expect(html).not.toContain("2026：机会变多");
    expect(html).not.toContain('class="weekly-timeline"');
    expect(html).toContain("海棠未眠");
    expect(html).toContain("brand-lockup-primary");
    expect(html).toContain("brand-lockup-aux");
    expect(html).toContain("OraSage");
    expect(html).toContain("share-card");
    expect(html).toContain("data-share-open");
    expect(html).toContain("og:title");
    expect(html).not.toContain('class="elements-donut"');
    expect(html).not.toContain('class="balance-gauge"');
    expect(html).toContain('class="wx-radar"');
    expect(html).toContain("四柱命盘");
    expect(html).toContain("mingpan-board is-single-row");
    expect(html).toContain("is-day-master");
    expect(html).toContain("庚");
    expect(html).toContain("乙");
    expect(html).toContain("核心洞察");
    expect(html).toContain('data-dom-id="simple-elements"');
    expect(html).toContain('class="bv-donut"');
    expect(html).not.toContain("tailwindcss");
    expect(html).not.toContain("lucide");
    expect(html).not.toContain("Vibe Camp");
    expect(html).not.toContain("$0.99");
    const main = html.split("<main")[1]?.split("</main>")[0] ?? "";
    expect(main.indexOf("四柱命盘")).toBeLessThan(main.indexOf("五行分析"));
    expect(main.indexOf("五行分析")).toBeLessThan(main.indexOf("核心洞察"));
    const note = (main.match(/simple-insight[\s\S]*?<p>([\s\S]*?)<\/p>/) || [])[1] || "";
    expect([...note.replace(/<[^>]+>/g, "")].length).toBeLessThanOrEqual(200);
    expect(html).toContain("查看完整命理报告");
    expect(html).toContain("付费解锁详细解读");
    expect(html).toContain("shop.orasage.com/checkout");
    expect(html).toContain("sku=report-bazi-basic");
    expect(html).toContain("喜用：水、木");
    expect(html).toContain("忌神：火");
    expect(html).toContain("84%");
  });

  it("free brief without ### keeps the AI paragraph and does not duplicate luckyLine", () => {
    const paragraph = "日主乙木身强，支持多于消耗，适合把力气花在表达和行动上。体系里叫身强食伤有气。";
    const lucky = "白色、黑色，西方、北方。颜色与方位不代表运势。";
    const html = buildReportPageHtml({
      planLabel: "结构速览",
      reportContent: paragraph,
      subjectName: "张三",
      shareUrl: "https://bazi.orasage.com/reports/demo.html",
      showUpgrade: true,
      tier: "free",
      chart: {
        riZhu: "乙",
        strength: "身强",
        dayMasterLine: "代表你的字：乙（木）　·　身强",
        year: { gan: "庚", zhi: "午" },
        month: { gan: "己", zhi: "卯" },
        day: { gan: "乙", zhi: "亥" },
        hour: { gan: "丙", zhi: "子" },
        wuXing: { 木: 3, 火: 2, 土: 2, 金: 1, 水: 1 },
        luckyLine: lucky,
      },
    });
    const main = html.split("<main")[1]?.split("</main>")[0] ?? "";
    const note = (main.match(/simple-insight[\s\S]*?<p>([\s\S]*?)<\/p>/) || [])[1] || "";
    expect(note).toContain("日主乙木身强");
    expect(note).not.toContain("白色");
    expect(html).toContain("白色");
    expect(html.split("白色").length - 1).toBe(1);
    expect([...note].length).toBeLessThanOrEqual(200);

    const dupHtml = buildReportPageHtml({
      planLabel: "结构速览",
      reportContent: `${paragraph}${lucky}`,
      subjectName: "张三",
      showUpgrade: true,
      tier: "free",
      chart: {
        year: { gan: "庚", zhi: "午" },
        month: { gan: "己", zhi: "卯" },
        day: { gan: "乙", zhi: "亥" },
        hour: { gan: "丙", zhi: "子" },
        wuXing: { 木: 3, 火: 2, 土: 2, 金: 1, 水: 1 },
        luckyLine: lucky,
      },
    });
    const dupMain = dupHtml.split("<main")[1]?.split("</main>")[0] ?? "";
    const dupNote = (dupMain.match(/simple-insight[\s\S]*?<p>([\s\S]*?)<\/p>/) || [])[1] || "";
    expect(dupNote.split("白色").length - 1).toBe(1);
    expect(dupNote).toContain("日主乙木身强");
    expect(dupNote).toContain("白色");
  });

  it("paid magazine page is the full reading without paywall", () => {
    const html = buildReportPageHtml({
      planLabel: "深度解读",
      reportContent: `### 命盘总览
日主乙木，生于卯月，身强。

### 性格与天赋
格局正印格，聪慧稳重。`,
      subjectName: "张三",
      shareUrl: "https://bazi.orasage.com/reports/demo.html",
      showUpgrade: false,
      tier: "paid",
      chart: {
        riZhu: "乙",
        strength: "身强",
        dayMasterLine: "代表你的字：乙（木）　·　身强",
        year: { gan: "庚", zhi: "午" },
        month: { gan: "己", zhi: "卯" },
        day: { gan: "乙", zhi: "亥" },
        hour: { gan: "丙", zhi: "子" },
        wuXing: { 木: 3, 火: 2, 土: 2, 金: 1, 水: 1 },
      },
    });
    expect(html).toContain("你的命局解读");
    expect(html).toContain('data-report-tier="paid"');
    expect(html).toContain('class="weekly-timeline"');
    expect(html).toContain('class="elements-donut"');
    expect(html).not.toContain("解锁完整命局报告");
    expect(html).not.toContain('class="paywall-cta"');
    expect(html).not.toContain('data-brief-layout="v4"');
    expect(html).not.toContain("brief-vibe");
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

  it("buildReportPageHtml skips four-pillar board when no pillars are present", () => {
    const html = buildReportPageHtml({
      planLabel: "深度解读",
      reportContent: "### 开运建议\n佩戴水晶。",
      chart: { wuXing: { 木: 1, 火: 1, 土: 1, 金: 1, 水: 1 } },
    });
    expect(html).not.toContain('class="mingpan-board"');
    expect(html).not.toContain("四柱命盘");
    expect(html).toContain('class="wx-radar"');
    expect(html).toContain('class="elements-donut"');
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

describe("condenseBriefCopy", () => {
  it("keeps short text and caps long text at 200 characters", () => {
    expect(condenseBriefCopy("日主乙木，身强。")).toBe("日主乙木，身强。");
    const long = "甲".repeat(250);
    expect([...condenseBriefCopy(long)].length).toBeLessThanOrEqual(201);
  });

  it("cuts on a sentence boundary when possible", () => {
    const src = `${"甲".repeat(80)}。${"乙".repeat(150)}`;
    const out = condenseBriefCopy(src);
    expect(out.endsWith("。")).toBe(true);
    expect(out).not.toContain("乙");
  });
});

describe("relayoutFreeBriefHtml", () => {
  it("reorders an old free page to Vibe cards with pillars, elements, then insight", () => {
    const old = `<html lang="zh-CN" data-report-tier="free">
<main>
<section class="section" id="section-01" data-toc="开篇"><p>${"叙述".repeat(80)}</p></section>
<section class="section section-mingpan" id="section-02" data-toc="四柱命盘"><div class="mingpan-board">
  <div class="mp-pillar"><div class="mp-label">年柱</div><div class="mp-gan">庚</div><div class="mp-zhi">午</div></div>
  <div class="mp-pillar"><div class="mp-label">月柱</div><div class="mp-gan">己</div><div class="mp-zhi">卯</div></div>
  <div class="mp-pillar is-day-master"><div class="mp-label">日柱</div><div class="mp-gan">乙</div><div class="mp-zhi">亥</div></div>
  <div class="mp-pillar"><div class="mp-label">时柱</div><div class="mp-gan">丙</div><div class="mp-zhi">子</div></div>
</div></section>
<section class="section section-elements" id="section-03" data-toc="五行分布">
  <div class="elements-donut"></div>
  <div class="element-item"><div class="element-symbol">木</div><div class="element-percent">30%</div></div>
  <div class="element-item"><div class="element-symbol">火</div><div class="element-percent">20%</div></div>
  <div class="element-item"><div class="element-symbol">土</div><div class="element-percent">20%</div></div>
  <div class="element-item"><div class="element-symbol">金</div><div class="element-percent">15%</div></div>
  <div class="element-item"><div class="element-symbol">水</div><div class="element-percent">15%</div></div>
  <div class="wx-radar-wrap"><svg class="wx-radar"></svg><p class="wx-radar-caption">雷达</p></div>
</section>
</main>
</html>`;
    const out = relayoutFreeBriefHtml(old);
    expect(out).toContain('data-brief-layout="v4"');
    expect(out).toContain('data-brief-skin="ochre"');
    expect(out).toContain("#c96442");
    expect(out).toContain("brief-vibe");
    const main = out.split("<main")[1]?.split("</main>")[0] ?? "";
    expect(main.indexOf("四柱命盘")).toBeLessThan(main.indexOf("五行分析"));
    expect(main.indexOf("五行分析")).toBeLessThan(main.indexOf("核心洞察"));
    expect(main).toContain('class="bv-donut"');
    expect(main).toContain("庚");
    const note = (main.match(/simple-insight[\s\S]*?<p>([\s\S]*?)<\/p>/) || [])[1] || "";
    expect(note).toContain("叙述");
    expect([...note].length).toBeLessThanOrEqual(200);
    expect(out).not.toContain("Vibe Camp");
  });

  it("relayout note uses body copy, not section chrome", () => {
    const old = `<html lang="zh-CN" data-report-tier="free">
<main>
<section class="section" id="section-01" data-toc="这套配置在说什么">
  <div class="section-header">
    <div class="section-number">01</div>
    <h2 class="section-title">这套配置在说什么</h2>
    <p class="section-subtitle">你命局中最本质的能量特质与人生基调</p>
  </div>
  <div class="section-body"><p>你落地的那一段，是一年里火气刚抬头的夏初。</p></div>
</section>
<section class="section section-mingpan"><div class="mingpan-board"></div></section>
<section class="section section-elements">
  <div class="elements-donut"><span>木 3</span></div>
  <div class="wx-radar-wrap"><svg class="wx-radar"></svg></div>
</section>
</main>
</html>`;
    const note = ((relayoutFreeBriefHtml(old).split("<main")[1] || "").match(/simple-insight[\s\S]*?<p>([\s\S]*?)<\/p>/) || [])[1] || "";
    expect(note).toContain("你落地的那一段");
    expect(note).not.toContain("这套配置在说什么");
    expect(note).not.toContain("最本质的能量特质");
  });
});
