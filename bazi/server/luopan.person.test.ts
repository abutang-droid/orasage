import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi, beforeAll } from "vitest";
import { calcSingleBazi, ZANG_GAN_MAP } from "../client/src/lib/bazi";
import { cangGanList, luopanToPersonInput } from "../client/src/pages/luopan/luopanPerson";
import type { LuopanDialState } from "../client/src/pages/luopan/engine.js";

const DIAL: LuopanDialState = {
  y: 1962,
  m: 8,
  d: 14,
  hh: 15,
  mi: 30,
  sex: "男",
  calendar: "solar",
  lunarYear: 1962,
  lunarMonth: 7,
  lunarDay: 15,
  lunarLeap: false,
};

describe("luopanToPersonInput", () => {
  it("maps a solar dial the same way as classic Home (gregorian + city coords)", () => {
    const input = luopanToPersonInput(DIAL, {
      city: "北京",
      country: "中国",
      lng: 116.4074,
      lat: 39.9042,
      timezone: "+8",
    });
    expect(input).toMatchObject({
      name: "访客",
      gender: "male",
      year: 1962,
      month: 8,
      day: 14,
      hour: 15,
      minute: 30,
      calendar: "gregorian",
      birthplace: "北京",
      cityName: "北京",
      lng: 116.4074,
      lat: 39.9042,
      timezone: "+8",
    });
    expect(input.isLeapMonth).toBeUndefined();
  });

  it("maps a lunar leap month onto calendar=lunar", () => {
    const input = luopanToPersonInput(
      { ...DIAL, calendar: "lunar", sex: "女", lunarLeap: true, lunarMonth: 4 },
      { city: "上海", country: "中国" },
    );
    expect(input.calendar).toBe("lunar");
    expect(input.gender).toBe("female");
    expect(input.year).toBe(1962);
    expect(input.month).toBe(4);
    expect(input.day).toBe(15);
    expect(input.isLeapMonth).toBe(true);
    expect(input.lng).toBeUndefined();
  });

  it("lists 藏干 in official weight order", () => {
    expect(cangGanList("巳", ZANG_GAN_MAP)).toEqual(["丙", "戊", "庚"]);
    expect(cangGanList("子", ZANG_GAN_MAP)).toEqual(["癸"]);
  });
});

describe("bracelet fallback", () => {
  it("picks the weakest 五行 SKU when recommend API is missing", async () => {
    const { fallbackRecommendFromChart } = await import("../client/src/lib/shop-products");
    const product = fallbackRecommendFromChart({
      birthStr: "公历 1962年8月14日 15:30",
      gender: "male",
      name: "访客",
      wuXing: { 木: 1.6, 火: 0.3, 土: 1.4, 金: 1.8, 水: 2.9 },
    });
    expect(product?.element).toBe("火");
    expect(product?.sku).toBe("crystal-fire");
    expect(product?.name).toContain("火");
  });
});

describe("luopan ranking uses calcSingleBazi", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const decadePath = join(here, "../client/public/data/data_1960s_7b72e69a.json");

  beforeAll(() => {
    const decade = JSON.parse(readFileSync(decadePath, "utf8"));
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const href = String(url);
        if (href.includes("1960s")) {
          return { json: async () => decade } as Response;
        }
        return { json: async () => [] } as Response;
      }),
    );
  });

  it("returns official 四柱 / 格局 / 喜忌 / 大运 for the luopan sample birth", async () => {
    const input = luopanToPersonInput(DIAL, {
      city: "北京",
      country: "中国",
      lng: 116.4074,
      lat: 39.9042,
      timezone: "+8",
    });
    const result = await calcSingleBazi(input);
    expect(`${result.year.gan}${result.year.zhi}`).toBe("壬寅");
    expect(`${result.month.gan}${result.month.zhi}`).toBe("戊申");
    expect(`${result.day.gan}${result.day.zhi}`).toBe("甲申");
    expect(result.riZhu).toBe("甲");
    expect(result.hour.gan).toBeTruthy();
    expect(result.hour.zhi).toBeTruthy();
    expect(result.pattern.primary).toBeTruthy();
    expect(result.strength).toBeTruthy();
    expect(result.favorable.length).toBeGreaterThan(0);
    expect(result.daYun.length).toBe(8);
    expect(Object.keys(result.shensha).length).toBeGreaterThan(0);
    expect(result.birthCity).toBe("北京");
    expect(result.trueSolarOffset).toBeDefined();
  });

  it("does not keep the prototype paipan kernel in the dial engine", () => {
    const src = readFileSync(join(here, "../client/src/pages/luopan/engine.js"), "utf8");
    expect(src).not.toMatch(/function paipan\s*\(/);
    expect(src).not.toMatch(/function showResult\s*\(/);
    expect(src).toMatch(/hooks\.onGo\(getState\(\)\)/);
  });
});
