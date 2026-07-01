import { describe, it, expect } from "vitest";
import { renderMarkdown } from "../reportHtml";

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
});
