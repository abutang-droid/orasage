import { describe, expect, it } from "vitest";
import { matchLocalCity, searchCities } from "./search.ts";
import type { CityRecord } from "./types.ts";

const testData: CityRecord[] = [
  { city: "北京", province: "北京", country: "中国", lng: 116.4074, lat: 39.9042, timezone: "+8", pinyin: "BJ" },
  { city: "石首", province: "湖北", country: "中国", lng: 112.4253, lat: 29.7205, timezone: "+8", alias: ["石首市"], pinyin: "SS" },
  { city: "四平", province: "吉林", country: "中国", lng: 124.3768, lat: 43.1726, timezone: "+8", pinyin: "SP" },
  { city: "东京", province: "关东", country: "日本", lng: 139.6917, lat: 35.6895, timezone: "+9", alias: ["Tokyo"], pinyin: "DJ" },
];

describe("@orasage/city search", () => {
  it("精确匹配石首", () => {
    expect(matchLocalCity(testData, "石首")?.city).toBe("石首");
  });

  it("拼音匹配北京", () => {
    expect(searchCities(testData, "BJ", 1)[0]?.city).toBe("北京");
  });

  it("全球城市 alias 匹配", () => {
    expect(matchLocalCity(testData, "Tokyo")?.city).toBe("东京");
  });

  it("吉林四平不误匹配吉林", () => {
    expect(matchLocalCity(testData, "吉林四平")).toBeNull();
  });
});
