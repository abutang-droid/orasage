import { describe, it, expect } from "vitest";
import { buildSingleBaziPrompt, buildFreeInsightPrompt, formatEngineVerdict } from "./prompts.ts";
import { buildTieKouFreeInsight } from "../client/src/lib/tiekou-insight.ts";

const sample = {
  name: "测试",
  gender: "male",
  birthStr: "1990-05-15 08:00",
  riZhu: "甲",
  strength: "身弱",
  favorable: ["水", "木"],
  unfavorable: ["金"],
  wuXing: { 木: 2, 火: 1, 土: 2, 金: 2, 水: 3 },
  year: { gan: "庚", zhi: "午", naYin: "路旁土" },
  month: { gan: "辛", zhi: "巳", naYin: "白蜡金" },
  day: { gan: "甲", zhi: "子", naYin: "海中金" },
  hour: { gan: "戊", zhi: "辰", naYin: "大林木" },
  shiShen: { 庚: "正财", 辛: "偏财", 甲: "比肩", 戊: "偏印" },
  shensha: { 天乙贵人: ["丑", "未"] },
  daYun: [{ startAge: 8, gan: "壬", zhi: "午", endAge: 17 }],
  pattern: {
    primary: "食神格",
    secondary: ["印绶格"],
    description: "食神泄秀，印星护身。",
    fullLabel: "食神格 · 印绶",
  },
  climate: {
    active: true,
    type: "fire_drought",
    description: "夏火炎燥，优先调候用水。",
    overrideFavorable: ["水"],
    overrideUnfavorable: ["火"],
  },
  flowIssues: [{ severity: "warning", label: "土重埋金", description: "土气偏重，金气受阻。" }],
  deadPoint: {
    target: "子",
    attacker: "午",
    mechanism: "子午冲",
    insight: "日支受冲，根基不稳。",
  },
  oneLineHit: { headline: "火重水亏", subline: "先调候", tone: "锐利" },
};

describe("铁口直断 prompt wiring", () => {
  it("system path still names 铁口直断 and 4-layer engine", () => {
    const prompt = buildSingleBaziPrompt(sample, "zh-CN");
    expect(prompt).toContain("铁口直断");
    expect(prompt).toContain("4 层过滤");
    expect(prompt).toContain("命盘总览");
    expect(prompt).toContain("开运建议");
  });

  it("embeds engine verdict fields", () => {
    const verdict = formatEngineVerdict(sample);
    expect(verdict).toContain("格局定型");
    expect(verdict).toContain("食神格");
    expect(verdict).toContain("调候（L2）");
    expect(verdict).toContain("夏火炎燥");
    expect(verdict).toContain("死锁点（L4）");
    expect(verdict).toContain("一句击中");
    expect(verdict).toContain("火重水亏");

    const prompt = buildSingleBaziPrompt(sample, "zh-CN");
    expect(prompt).toContain("OraSage 四层过滤引擎裁决");
    expect(prompt).toContain("火重水亏");
    expect(prompt).toContain("神煞");
  });

  it("free insight prompt also carries engine verdict", () => {
    const prompt = buildFreeInsightPrompt(sample, "zh-CN");
    expect(prompt).toContain("铁口直断");
    expect(prompt).toContain("食神格");
    expect(prompt).toContain("死锁点");
  });

  it("classic free result builder applies four-layer engine (not vernacular)", () => {
    const insight = buildTieKouFreeInsight(sample as any);
    expect(insight.headline).toBe("火重水亏");
    expect(insight.patternLabel).toContain("食神格");
    const titles = insight.blocks.map((b) => b.title).join("|");
    expect(titles).toContain("铁口直断 · 格局强弱喜忌");
    expect(titles).toContain("调候（L2）");
    expect(titles).toContain("死锁点（L4）");
    expect(titles).toContain("气机（L3）");
    expect(insight.blocks.some((b) => b.kind === "creed")).toBe(true);
    expect(JSON.stringify(insight)).not.toContain("现象");
    expect(JSON.stringify(insight)).not.toContain("体系里叫");
  });

  it("VibeBaziReport binds Tie Kou insight, not composeFreeReport", async () => {
    const { readFileSync } = await import("fs");
    const src = readFileSync(new URL("../client/src/components/VibeBaziReport.tsx", import.meta.url), "utf8");
    expect(src).toContain("buildTieKouFreeInsight");
    expect(src).toContain("铁口直断 · 格局强弱喜忌");
    expect(src).not.toContain("composeFreeReport");
    expect(src).not.toContain("白话速读");
    expect(src).toContain("TEASER_ICONS");
  });
});
