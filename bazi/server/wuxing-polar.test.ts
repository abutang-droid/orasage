import { describe, expect, it } from "vitest";
import {
  WX_POLAR_ORDER,
  buildWxPolarModel,
  buildWxPieModel,
  classifyWxBalance,
  formatWxBalanceLead,
  joinWxNamesZh,
  pieSlicePath,
  roundPercents,
  slicePath,
} from "../client/src/lib/wuxingPolar";

describe("roundPercents", () => {
  it("sums to 100 for the reference chart counts", () => {
    // 35+25+20+15+5 — already 100
    const pct = roundPercents([25, 35, 5, 15, 20]);
    expect(pct.reduce((a, b) => a + b, 0)).toBe(100);
    expect(pct).toEqual([25, 35, 5, 15, 20]);
  });

  it("rounds remainders so percents still sum to 100", () => {
    const pct = roundPercents([1, 1, 1]);
    expect(pct.reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("returns zeros when empty", () => {
    expect(roundPercents([0, 0, 0, 0, 0])).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("buildWxPolarModel", () => {
  it("places 金 at the top and 木 to its clockwise right", () => {
    const slices = buildWxPolarModel({ 金: 25, 木: 35, 水: 5, 火: 15, 土: 20 });
    expect(slices.map((s) => s.name)).toEqual([...WX_POLAR_ORDER]);
    const jin = slices[0];
    const mu = slices[1];
    expect(jin.midDeg).toBe(-90);
    expect(mu.midDeg).toBe(-18);
    expect(mu.percent).toBe(35);
    expect(mu.radiusRatio).toBe(1);
    expect(jin.radiusRatio).toBeCloseTo(25 / 35);
    const shui = slices.find((s) => s.name === "水")!;
    expect(shui.radiusRatio).toBeCloseTo(5 / 35);
  });

  it("treats missing keys as zero", () => {
    const slices = buildWxPolarModel({ 木: 2 });
    expect(slices.find((s) => s.name === "木")?.percent).toBe(100);
    expect(slices.find((s) => s.name === "金")?.percent).toBe(0);
  });
});

describe("slicePath", () => {
  it("draws a wedge from the origin", () => {
    const d = slicePath(0, 0, 10, -90, -18);
    expect(d.startsWith("M 0 0 L ")).toBe(true);
    expect(d.includes(" A 10 10 0 0 1 ")).toBe(true);
    expect(d.endsWith(" Z")).toBe(true);
  });
});

describe("buildWxPieModel", () => {
  it("uses angle, not radius, for the poster 金22 木20 水36 火4 土18 chart", () => {
    const slices = buildWxPieModel({ 金: 22, 木: 20, 水: 36, 火: 4, 土: 18 });
    expect(slices.map((s) => s.name)).toEqual([...WX_POLAR_ORDER]);
    expect(slices.map((s) => s.percent)).toEqual([22, 20, 36, 4, 18]);
    expect(slices[0].startDeg).toBe(-90);
    expect(slices[0].endDeg - slices[0].startDeg).toBeCloseTo(79.2);
    expect(slices.find((s) => s.name === "水")!.endDeg - slices.find((s) => s.name === "水")!.startDeg).toBeCloseTo(129.6);
    expect(slices.find((s) => s.name === "火")!.explode).toBe(true);
    expect(slices.filter((s) => s.name !== "火").every((s) => !s.explode)).toBe(true);

    const cramped = buildWxPieModel({ 金: 21, 木: 25, 水: 29, 火: 16, 土: 9 });
    expect(cramped.find((s) => s.name === "土")!.explode).toBe(true);
    expect(cramped.find((s) => s.name === "火")!.explode).toBe(false);
  });

  it("does not explode mid-size slices", () => {
    const slices = buildWxPieModel({ 金: 20, 木: 20, 水: 20, 火: 20, 土: 20 });
    expect(slices.every((s) => !s.explode)).toBe(true);
  });
});

describe("classifyWxBalance", () => {
  it("matches the poster 旺/次/弱 reading", () => {
    const slices = buildWxPieModel({ 金: 22, 木: 20, 水: 36, 火: 4, 土: 18 });
    const b = classifyWxBalance(slices);
    expect(b.wang).toEqual(["水", "金"]);
    expect(b.ci).toEqual(["木", "土"]);
    expect(b.ruo).toEqual(["火"]);
    expect(b.adviceWx).toBe("火");
    expect(b.balanced).toBe(false);
    expect(formatWxBalanceLead(b, joinWxNamesZh)).toBe("水、金较旺，木、土次之，火偏弱");
  });

  it("treats an even spread as balanced", () => {
    const slices = buildWxPieModel({ 金: 20, 木: 20, 水: 20, 火: 20, 土: 20 });
    const b = classifyWxBalance(slices);
    expect(b.balanced).toBe(true);
    expect(b.adviceWx).toBeNull();
    expect(formatWxBalanceLead(b, joinWxNamesZh)).toBe("");
  });
});

describe("pieSlicePath", () => {
  it("draws a full circle as two arcs", () => {
    const d = pieSlicePath(0, 0, 10, -90, 270);
    expect(d.includes(" A 10 10 0 1 1 ")).toBe(true);
    expect(d.endsWith(" Z")).toBe(true);
  });
});
