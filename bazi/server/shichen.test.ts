import { describe, expect, it } from "vitest";
import { Solar } from "lunar-javascript";
import { DI_ZHI, getShiZhu, hourToZhiIndex, luopanHourZhiIndex } from "../shared/shichen.ts";

/** lunar-javascript 的时辰地支（去掉干，只比地支）。 */
function lunarTimeZhi(year: number, month: number, day: number, hour: number, minute: number): string {
  const lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
  return String(lunar.getTimeInGanZhi()).slice(1);
}

describe("hourToZhiIndex — original lunar-javascript / luopan blocks", () => {
  const cases: Array<[number, number, string]> = [
    [23, 0, "子"],
    [23, 59, "子"],
    [0, 0, "子"],
    [0, 59, "子"],
    [1, 0, "丑"],
    [2, 59, "丑"],
    [3, 0, "寅"],
    [5, 0, "卯"],
    [5, 1, "卯"],
    [6, 20, "卯"],
    [6, 59, "卯"],
    [7, 0, "辰"],
    [21, 0, "亥"],
    [22, 59, "亥"],
  ];

  it.each(cases)("%s:%s → %s", (hour, minute, zhi) => {
    expect(DI_ZHI[hourToZhiIndex(hour, minute)]).toBe(zhi);
    expect(DI_ZHI[luopanHourZhiIndex(hour)]).toBe(zhi);
  });

  it("matches luopan tz=((hh+1)/2|0)%12 for every clock hour", () => {
    for (let hh = 0; hh < 24; hh++) {
      expect(hourToZhiIndex(hh)).toBe(luopanHourZhiIndex(hh));
      expect(hourToZhiIndex(hh)).toBe(((hh + 1) / 2 | 0) % 12);
    }
  });

  it("matches lunar-javascript getTimeZhiIndex across a day", () => {
    for (let hh = 0; hh < 24; hh++) {
      expect(DI_ZHI[hourToZhiIndex(hh, 0)]).toBe(lunarTimeZhi(1991, 3, 14, hh, 0));
      expect(DI_ZHI[hourToZhiIndex(hh, 20)]).toBe(lunarTimeZhi(1991, 3, 14, hh, 20));
    }
  });
});

describe("getShiZhu — 五鼠遁 on 癸日", () => {
  it("1991-03-14 06:20 癸未 → 乙卯", () => {
    expect(getShiZhu("癸未", 6, 20)).toBe("乙卯");
  });

  it("23:00 is 子 (壬子), not 亥", () => {
    expect(getShiZhu("癸未", 23, 0)).toBe("壬子");
  });

  it("01:00 is 丑, 05:00 is 卯, 07:00 is 辰", () => {
    expect(getShiZhu("癸未", 1, 0)).toBe("癸丑");
    expect(getShiZhu("癸未", 5, 0)).toBe("乙卯");
    expect(getShiZhu("癸未", 7, 0)).toBe("丙辰");
  });

  it("甲己日起甲子", () => {
    expect(getShiZhu("甲子", 23, 0)).toBe("甲子");
    expect(getShiZhu("己卯", 0, 0)).toBe("甲子");
  });
});
