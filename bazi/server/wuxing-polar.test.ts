import { describe, expect, it } from "vitest";
import {
  WX_POLAR_ORDER,
  buildWxPolarModel,
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
