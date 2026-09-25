import { describe, expect, it } from "vitest";
import { composeFreeReport } from "../shared/free-report.ts";
import { polarTag, strengthShort, strengthLong } from "../shared/vernacular.ts";
import { sanitizeVernacularText } from "../shared/vernacular-sanitize.ts";
import { buildFreeInsightPrompt, buildSingleBaziPrompt } from "./prompts.ts";

const GUI_MAO = {
  name: "Test",
  riZhu: "癸",
  strength: "身弱",
  favorable: ["金", "水"],
  unfavorable: ["土", "木"],
  year: { gan: "辛", zhi: "未" },
  month: { gan: "辛", zhi: "卯" },
  day: { gan: "癸", zhi: "未" },
  hour: { gan: "乙", zhi: "卯" },
  shiShen: { 辛: "偏印", 乙: "食神", 癸: "比肩" },
  pattern: { primary: "食神格", secondary: ["偏印格"], keyStems: ["食神", "偏印"] },
};

describe("vernacular lexicon", () => {
  it("labels 辛未 as 阴金 / 土 and day pillar as 阴水（你）", () => {
    expect(polarTag("辛", "未")).toBe("阴金 / 土");
    expect(polarTag("癸", "未", true)).toBe("阴水（你） / 土");
    expect(polarTag("乙", "卯")).toBe("阴木 / 木");
  });

  it("uses 偏耗 / 偏补 short labels", () => {
    expect(strengthShort("身弱")).toBe("偏耗");
    expect(strengthShort("身强")).toBe("偏补");
    expect(strengthShort("身弱", "en")).toBe("Drain-heavy");
    expect(strengthLong("身弱")).toBe("支持你的力量少于消耗你的力量");
  });
});

describe("composeFreeReport", () => {
  it("rewrites the 癸水 卯月 free report in phenomenon → mechanism → term order", () => {
    const report = composeFreeReport(GUI_MAO, "zh-CN");
    expect(report.dayMasterLine).toContain("代表你的字：癸（水）");
    expect(report.dayMasterLine).toContain("偏耗");
    expect(report.gridCaption).toContain("内含");
    expect(report.gridCaption).toContain("日主");

    const text = report.sections.map((s) => s.title + s.body + s.classic).join("\n");
    expect(text).toContain("细、渗");
    expect(text).toContain("木最纯、长势最盛的时候");
    expect(text).toContain("支持你的力量少于消耗你的力量");
    expect(text).toContain("金与水");
    expect(text).toContain("土与木");
    expect(text).toContain("两项");
    expect(text).toContain("体系里叫");
    expect(text).toContain("这个结构是立得住的");
    expect(text).toContain("两个辛");
    expect(text).toContain("食神旺而偏印重叠");
    expect(text).toContain("2026 年（丙午）");
    expect(text).toContain("财旺合印");
    expect(report.luckyLine).toContain("白色");
    expect(report.luckyLine).toContain("黑色");
    expect(report.luckyLine).toContain("西方");
    expect(report.luckyLine).toContain("北方");
    expect(text).not.toMatch(/^癸水生于卯月/);
    expect(text).not.toContain("投资");
    expect(text).not.toContain("心脑");
    expect(text).not.toContain("之疾");
    expect(text).not.toContain("身体弱");
    expect(report.luckyNote).toContain("不代表运势");

    const bodySansTail = report.sections.map((s) => s.title + s.body).join("\n");
    expect(bodySansTail).not.toContain("身弱");
    expect(bodySansTail).not.toContain("透干");
    expect(bodySansTail).not.toContain("格成有救");
  });

  it("keeps classic terms only in the tail", () => {
    const report = composeFreeReport(GUI_MAO, "zh-CN");
    for (const s of report.sections) {
      expect(s.classic.startsWith("体系里叫")).toBe(true);
    }
  });
});

describe("sanitizeVernacularText", () => {
  it("downgrades causal claims and forbidden glosses", () => {
    const raw = "癸水生于卯月，身弱。忌神土木。防投资失利及心脑火旺之疾。格成有救。用神为金。";
    const out = sanitizeVernacularText(raw);
    expect(out).toContain("支持你的力量少于消耗你的力量");
    expect(out).toContain("最容易让你失衡的那一项");
    expect(out).toContain("这个结构是立得住的");
    expect(out).toContain("对你最有用的那一项");
    expect(out).not.toContain("投资失利");
    expect(out).not.toContain("心脑");
    expect(out).not.toContain("身弱");
  });

  it("keeps 身弱 inside 体系里叫 tails", () => {
    const raw = "支持少于消耗。体系里叫「癸水生于卯月，身弱」。";
    const out = sanitizeVernacularText(raw);
    expect(out).toContain("体系里叫「癸水生于卯月，身弱」");
    expect(out.startsWith("支持少于消耗")).toBe(true);
  });
});

describe("LLM prompts follow the spec", () => {
  it("free insight prompt forbids health/finance claims and requires term-last order", () => {
    const p = buildFreeInsightPrompt({
      name: "Test",
      gender: "male",
      birthStr: "1991-03-14",
      riZhu: "癸",
      strength: "身弱",
      favorable: ["金", "水"],
      unfavorable: ["土", "木"],
      year: { gan: "辛", zhi: "未" },
      month: { gan: "辛", zhi: "卯" },
      day: { gan: "癸", zhi: "未" },
      hour: { gan: "乙", zhi: "卯" },
    }, "zh-CN");
    expect(p).toContain("现象");
    expect(p).toContain("体系里叫");
    expect(p).toContain("偏耗");
    expect(p).toContain("不得");
    expect(p).toMatch(/投资|疾病|心脑/);
  });

  it("paid report prompt uses vernacular chapter titles", () => {
    const p = buildSingleBaziPrompt({
      name: "Test",
      gender: "male",
      birthStr: "1991-03-14",
      riZhu: "癸",
      strength: "身弱",
      favorable: ["金"],
      unfavorable: ["木"],
    }, "zh-CN");
    expect(p).toContain("顺的方向");
    expect(p).toContain("每十年一换的阶段");
    expect(p).toContain("支持你的力量少于消耗你的力量");
  });
});
