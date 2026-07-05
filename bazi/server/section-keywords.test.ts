import { describe, it, expect } from "vitest";
import { extractSectionKeywords } from "../shared/section-keywords";

describe("extractSectionKeywords", () => {
  it("filters algorithm jargon and extracts bazi terms", () => {
    const content = "算法依据：日主乙木，生于卯月，身强用金。综合四层过滤分析命局。";
    const keywords = extractSectionKeywords(content, "命盘总览");
    expect(keywords).not.toContain("算法依据");
    expect(keywords).not.toContain("四层过滤");
    expect(keywords.some((k) => k.includes("日主") || k.includes("乙木"))).toBe(true);
    expect(keywords.some((k) => k.includes("卯月") || k.includes("生于"))).toBe(true);
  });

  it("extracts quoted phrases", () => {
    const content = "命局呈现「正印格」特征，喜用「金水」调和。";
    const keywords = extractSectionKeywords(content);
    expect(keywords).toContain("正印格");
  });

  it("uses section title as fallback", () => {
    const keywords = extractSectionKeywords("内容较为简短。", "事业与财富");
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords.some((k) => k.includes("事业") || k.includes("财富"))).toBe(true);
  });
});
