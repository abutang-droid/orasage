/**
 * 真太阳时修正逻辑单元测试
 *
 * 真太阳时修正原理：
 * - 标准经度 = 时区偏移 × 15（东八区标准经度 = 120°）
 * - 偏差分钟 = (实际经度 - 标准经度) × 4
 * - 旧金山 (西经 122.4°, UTC-8): 标准经度 = -120°, 偏差 = (-122.4 - (-120)) × 4 = -9.6 ≈ -10 分钟
 * - 北京 (东经 116.4°, UTC+8): 标准经度 = 120°, 偏差 = (116.4 - 120) × 4 = -14.4 ≈ -14 分钟
 * - 上海 (东经 121.5°, UTC+8): 标准经度 = 120°, 偏差 = (121.5 - 120) × 4 = 6 分钟
 */

import { describe, it, expect } from "vitest";

// 复现 bazi.ts 中的 applyTrueSolarTime 逻辑（服务端测试）
function applyTrueSolarTime(
  hour: number,
  minute: number,
  lng: number,
  timezone?: string
): { hour: number; minute: number } {
  const tzOffset = timezone ? parseFloat(timezone) : 8;
  const stdLng = tzOffset * 15;
  const offsetMinutes = (lng - stdLng) * 4;
  let totalMinutes = hour * 60 + minute + offsetMinutes;
  // 处理跨日
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  return {
    hour: Math.floor(totalMinutes / 60),
    minute: Math.round(totalMinutes % 60),
  };
}

function calcTrueSolarOffset(lng: number, timezone?: string): number {
  const tzOffset = timezone ? parseFloat(timezone) : 8;
  const stdLng = tzOffset * 15;
  return Math.round((lng - stdLng) * 4);
}

describe("真太阳时修正", () => {
  it("东八区标准经度（120°）偏差为 0", () => {
    const offset = calcTrueSolarOffset(120, "+8");
    expect(offset).toBe(0);
  });

  it("北京（东经 116.4°）偏差约 -14 分钟", () => {
    const offset = calcTrueSolarOffset(116.4074, "+8");
    expect(offset).toBe(-14); // (116.4074 - 120) × 4 ≈ -14.37 → -14
  });

  it("上海（东经 121.5°）偏差约 +6 分钟", () => {
    const offset = calcTrueSolarOffset(121.4737, "+8");
    expect(offset).toBe(6); // (121.4737 - 120) × 4 ≈ 5.89 → 6
  });

  it("旧金山（西经 122.4°, UTC-8）偏差约 -10 分钟", () => {
    const offset = calcTrueSolarOffset(-122.4194, "-8");
    expect(offset).toBe(-10); // (-122.4194 - (-120)) × 4 ≈ -9.68 → -10
  });

  it("新加坡（东经 103.8°, UTC+8）偏差约 -65 分钟", () => {
    const offset = calcTrueSolarOffset(103.8198, "+8");
    expect(offset).toBe(-65); // (103.8198 - 120) × 4 ≈ -64.72 → -65
  });

  it("时间修正：23:20 在旧金山（西经 122.4°, UTC-8）→ 约 23:10", () => {
    const result = applyTrueSolarTime(23, 20, -122.4194, "-8");
    expect(result.hour).toBe(23);
    expect(result.minute).toBe(10); // 23:20 - 10min = 23:10
  });

  it("时间修正：跨日处理（0:05 - 10min = 23:55 前一天）", () => {
    const result = applyTrueSolarTime(0, 5, 116.4074, "+8"); // 北京 -14min
    expect(result.hour).toBe(23);
    expect(result.minute).toBe(51); // 0:05 - 14min = 23:51 前一天
  });

  it("时间修正：23:59 + 正偏移不超过 24:00", () => {
    const result = applyTrueSolarTime(23, 59, 121.4737, "+8"); // 上海 +6min
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(5); // 23:59 + 6min = 0:05 次日
  });
});
