import { describe, expect, it } from "vitest";
import { parseSections } from "./routers";

describe("parseSections", () => {
  it("should parse a standard 7-section single report", () => {
    const markdown = `
### 命盘总览
这是命盘总览的内容，描述整体命局特点。

### 性格与天赋
从日柱、十神、五行分布解读性格底色。

### 事业与财富
结合喜用神、大运走势，分析适合的发展方向。

### 感情与关系
从夫妻宫、感情星解读感情模式。

### 健康与能量管理
根据五行偏颇，给出身体关注重点。

### 近期大运指引
结合当前所走大运，给出未来 3-5 年的重点方向。

### 给张三的一句话
天干地支，命由己造。

---
*注：本报告仅供参考。*
`;
    const sections = parseSections(markdown);
    expect(sections).toHaveLength(7);
    expect(sections[0].title).toBe("命盘总览");
    expect(sections[0].content).toContain("命盘总览的内容");
    expect(sections[1].title).toBe("性格与天赋");
    expect(sections[2].title).toBe("事业与财富");
    expect(sections[3].title).toBe("感情与关系");
    expect(sections[4].title).toBe("健康与能量管理");
    expect(sections[5].title).toBe("近期大运指引");
    expect(sections[6].title).toBe("给张三的一句话");
  });

  it("should parse a couple report with different section titles", () => {
    const markdown = `
### 缘分总评
两人整体缘分质量描述。

### 五行与能量互动
分析两人五行如何相互影响。

### 性格互动模式
从日柱、十神解读两人的性格碰撞。

### 感情与婚姻展望
分析这段关系的长期发展潜力。

### 关系中的成长功课
每个人在这段关系中能学到什么。

### 给两人的建议
三条具体可操作的相处建议。

### 一句话总结
缘分的核心主题。
`;
    const sections = parseSections(markdown);
    expect(sections).toHaveLength(7);
    expect(sections[0].title).toBe("缘分总评");
    expect(sections[6].title).toBe("一句话总结");
  });

  it("should strip disclaimer lines from section content", () => {
    const markdown = `
### 命盘总览
这是内容。

---
*注：本报告仅供参考。*
`;
    const sections = parseSections(markdown);
    expect(sections).toHaveLength(1);
    // 免责声明行和分隔线应被过滤掉
    expect(sections[0].content).not.toContain("---");
    expect(sections[0].content).not.toContain("*注：");
  });

  it("should return empty array for empty markdown", () => {
    const sections = parseSections("");
    expect(sections).toHaveLength(0);
  });

  it("should return empty array for markdown with no ### headings", () => {
    const sections = parseSections("这是一段没有标题的文字。\n\n另一段。");
    expect(sections).toHaveLength(0);
  });

  it("should trim whitespace from section content", () => {
    const markdown = `
### 命盘总览

   这是内容，前后有空行。   

`;
    const sections = parseSections(markdown);
    expect(sections).toHaveLength(1);
    expect(sections[0].content).toBe("这是内容，前后有空行。");
  });

  it("should handle multi-paragraph section content", () => {
    const markdown = `
### 命盘总览
第一段内容。

第二段内容。

### 性格与天赋
性格内容。
`;
    const sections = parseSections(markdown);
    expect(sections).toHaveLength(2);
    expect(sections[0].content).toContain("第一段内容");
    expect(sections[0].content).toContain("第二段内容");
  });
});
