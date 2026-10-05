import { describe, it, expect } from "vitest";
import { chartInputFingerprint, stableChartReadingId, chartKindFromResult } from "../shared/chart-identity.ts";

const sample = {
  name: "测试",
  gender: "male",
  birthStr: "1990-05-15 08:00",
  year: { gan: "庚", zhi: "午" },
  month: { gan: "辛", zhi: "巳" },
  day: { gan: "甲", zhi: "子" },
  hour: { gan: "戊", zhi: "辰" },
  birthplace: "北京",
};

describe("chart identity", () => {
  it("same input yields the same fingerprint", () => {
    expect(chartInputFingerprint(sample)).toBe(chartInputFingerprint({ ...sample }));
  });

  it("different birthplace changes fingerprint", () => {
    expect(chartInputFingerprint(sample)).not.toBe(
      chartInputFingerprint({ ...sample, birthplace: "上海" }),
    );
  });

  it("logged-in id ignores device; guest id includes device", () => {
    const fp = chartInputFingerprint(sample);
    const a = stableChartReadingId({ userId: 9, deviceId: "aaaa-aaaa", fingerprint: fp });
    const b = stableChartReadingId({ userId: 9, deviceId: "bbbb-bbbb", fingerprint: fp });
    expect(a).toBe(b);
    expect(a.startsWith("bazi_u9_")).toBe(true);
    const g1 = stableChartReadingId({ userId: 0, deviceId: "aaaa-aaaa", fingerprint: fp });
    const g2 = stableChartReadingId({ userId: 0, deviceId: "bbbb-bbbb", fingerprint: fp });
    expect(g1).not.toBe(g2);
    expect(g1.startsWith("bazi_d")).toBe(true);
  });

  it("detects couple payload", () => {
    expect(chartKindFromResult(sample)).toBe("single");
    expect(chartKindFromResult({ person1: sample, person2: sample })).toBe("couple");
  });

  it("couple fingerprint differs from single and is stable", () => {
    const couple = { person1: sample, person2: { ...sample, name: "乙" } };
    expect(chartInputFingerprint(couple)).not.toBe(chartInputFingerprint(sample));
    expect(chartInputFingerprint(couple)).toBe(chartInputFingerprint({ ...couple }));
  });

  it("calendar change changes fingerprint", () => {
    expect(chartInputFingerprint(sample)).not.toBe(
      chartInputFingerprint({ ...sample, calendar: "lunar" }),
    );
  });
});
