import { describe, expect, it } from "vitest";
import {
  applyCalibratedChart,
  localChartFromResult,
  parseCalibratedChart,
  parsePillar,
  parseWuXing,
} from "./chartCalibrate.ts";

const local = {
  year: { gan: "庚", zhi: "午" },
  month: { gan: "辛", zhi: "巳" },
  day: { gan: "甲", zhi: "子" },
  hour: { gan: "戊", zhi: "辰" },
  wuXing: { 木: 3, 火: 2, 土: 2, 金: 1, 水: 1 },
  riZhu: "甲",
};

describe("parsePillar / parseWuXing", () => {
  it("accepts object and two-character strings", () => {
    expect(parsePillar({ gan: "丁", zhi: "丑" })).toEqual({ gan: "丁", zhi: "丑" });
    expect(parsePillar("乙巳")).toEqual({ gan: "乙", zhi: "巳" });
    expect(parsePillar("乾坤")).toBeNull();
  });

  it("rejects incomplete wuxing", () => {
    expect(parseWuXing({ 木: 1, 火: 1 })).toBeNull();
    expect(parseWuXing({ 木: 1, 火: 1, 土: 1, 金: 1, 水: 1 })).toEqual({
      木: 1, 火: 1, 土: 1, 金: 1, 水: 1,
    });
  });
});

describe("parseCalibratedChart", () => {
  it("uses AI pillars and radar when JSON is valid", () => {
    const raw = JSON.stringify({
      year: "丁丑",
      month: { gan: "乙", zhi: "巳" },
      day: { gan: "乙", zhi: "卯" },
      hour: { gan: "癸", zhi: "未" },
      wuXing: { 木: 2.4, 火: 1, 土: 1.5, 金: 0.8, 水: 1.2 },
      riZhu: "乙木",
      note: "日主乙木，支持与消耗大致相当。",
    });
    const out = parseCalibratedChart(raw, local);
    expect(out.chart.year).toEqual({ gan: "丁", zhi: "丑" });
    expect(out.chart.month).toEqual({ gan: "乙", zhi: "巳" });
    expect(out.chart.riZhu).toBe("乙");
    expect(out.chart.wuXing.木).toBe(2.4);
    expect(out.note).toContain("日主乙木");
  });

  it("falls back to local chart when JSON is missing or illegal", () => {
    const plain = parseCalibratedChart("只是一段说明。", local);
    expect(plain.chart).toEqual(local);
    expect(plain.note).toBe("只是一段说明。");

    const bad = parseCalibratedChart(JSON.stringify({
      year: "xx",
      wuXing: { 木: -1, 火: 1, 土: 1, 金: 1, 水: 1 },
      note: "校准失败仍用这段。",
    }), local);
    expect(bad.chart.year).toEqual(local.year);
    expect(bad.chart.wuXing).toEqual(local.wuXing);
    expect(bad.note).toContain("校准失败");
  });
});

describe("applyCalibratedChart", () => {
  it("overlays pillars onto resultData used by HTML", () => {
    const localData = localChartFromResult({
      name: "测",
      riZhu: "甲",
      year: { gan: "庚", zhi: "午" },
      month: { gan: "辛", zhi: "巳" },
      day: { gan: "甲", zhi: "子" },
      hour: { gan: "戊", zhi: "辰" },
      wuXing: { 木: 3, 火: 2, 土: 2, 金: 1, 水: 1 },
    });
    expect(localData.riZhu).toBe("甲");
    const applied = applyCalibratedChart({ name: "测", riZhu: "甲" }, {
      ...local,
      year: { gan: "甲", zhi: "子" },
      riZhu: "戊",
    });
    expect(applied.year).toEqual({ gan: "甲", zhi: "子" });
    expect(applied.riZhu).toBe("戊");
  });
});
