/**
 * 生成 @orasage/city 种子数据（目标 ~592 城）
 * 用法：node packages/city/scripts/generate-city-seed.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { pinyin } = require("pinyin-pro");

const ROOT = join(__dirname, "..", "..", "..");
const cityDataPath = join(ROOT, "bazi", "client", "src", "lib", "cityData.ts");
const regionDataPath = join(ROOT, "bazi", "client", "src", "lib", "regionData.ts");
const outPath = join(__dirname, "..", "data", "cities-seed.json");

function extractCityDataArray(source) {
  const marker = "const CITY_DATA";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("CITY_DATA not found");
  const eq = source.indexOf("=", start);
  const arrStart = source.indexOf("[", eq);
  let depth = 0;
  for (let i = arrStart; i < source.length; i++) {
    if (source[i] === "[") depth++;
    if (source[i] === "]") {
      depth--;
      if (depth === 0) {
        // eslint-disable-next-line no-new-func
        return Function(`"use strict"; return (${source.slice(arrStart, i + 1)})`)();
      }
    }
  }
  throw new Error("CITY_DATA array parse failed");
}

function loadRegionData() {
  const src = readFileSync(regionDataPath, "utf8");
  const match = src.match(/export const regionData[^=]*=\s*(\{[\s\S]*\});\s*\n\nexport const provinces/);
  if (!match) throw new Error("regionData not found");
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${match[1]})`)();
}

function shortProvince(name) {
  return name
    .replace(/壮族自治区$/, "")
    .replace(/维吾尔自治区$/, "")
    .replace(/回族自治区$/, "")
    .replace(/自治区$/, "")
    .replace(/省$/, "")
    .replace(/市$/, "");
}

function shortCity(name) {
  return name.replace(/市$/, "").replace(/地区$/, "").replace(/盟$/, "");
}

function makePinyin(city) {
  if (!/[\u4e00-\u9fff]/.test(city)) return city.slice(0, 6).toUpperCase();
  const initials = pinyin(city, { pattern: "first", toneType: "none", type: "array" })
    .join("")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return initials || city.slice(0, 3).toUpperCase();
}

function keyOf(c) {
  return `${c.country}|${c.province}|${c.city}`;
}

const baseCities = extractCityDataArray(readFileSync(cityDataPath, "utf8"));
const regionData = loadRegionData();
const map = new Map();

for (const c of baseCities) {
  map.set(keyOf(c), {
    ...c,
    alias: c.alias ? [...c.alias] : undefined,
    pinyin: c.pinyin || makePinyin(c.city),
  });
}

// 从行政区划补全地级市与县级市
for (const [provinceName, cities] of Object.entries(regionData)) {
  const province = shortProvince(provinceName);
  for (const [prefectureName, districts] of Object.entries(cities)) {
    const prefectureShort = shortCity(prefectureName);
    const parentKey = `中国|${province}|${prefectureShort}`;
    let parent = map.get(parentKey);

    if (!parent) {
      // 尝试模糊匹配已有地级市
      parent = [...map.values()].find(
        (c) => c.country === "中国" && c.province === province && c.city === prefectureShort,
      );
    }

    if (!parent) {
      // 使用省内已有城市坐标近似（省会优先）
      const inProvince = [...map.values()].filter((c) => c.country === "中国" && c.province === province);
      const fallback = inProvince[0];
      if (fallback) {
        parent = {
          city: prefectureShort,
          country: "中国",
          province,
          lng: fallback.lng,
          lat: fallback.lat,
          timezone: fallback.timezone,
          pinyin: makePinyin(prefectureShort),
          alias: [`${prefectureShort}市`],
        };
        map.set(keyOf(parent), parent);
      }
    }

    if (!parent) continue;

    for (const district of districts) {
      if (!district.endsWith("市")) continue;
      const countyShort = shortCity(district);
      if (countyShort === prefectureShort) continue;
      const countyKey = `中国|${province}|${countyShort}`;
      if (map.has(countyKey)) continue;
      map.set(countyKey, {
        city: countyShort,
        country: "中国",
        province,
        lng: parent.lng,
        lat: parent.lat,
        timezone: parent.timezone,
        pinyin: makePinyin(countyShort),
        alias: [district],
      });
    }
  }
}

// 港澳台及常用全球城市补充
const extras = [
  { city: "香港", country: "中国", province: "香港", lng: 114.1694, lat: 22.3193, timezone: "+8", alias: ["Hong Kong"] },
  { city: "澳门", country: "中国", province: "澳门", lng: 113.5439, lat: 22.1987, timezone: "+8", alias: ["Macau"] },
  { city: "台北", country: "中国", province: "台湾", lng: 121.5654, lat: 25.033, timezone: "+8", alias: ["Taipei"] },
  { city: "高雄", country: "中国", province: "台湾", lng: 120.3014, lat: 22.6273, timezone: "+8", alias: ["Kaohsiung"] },
  { city: "石首", country: "中国", province: "湖北", lng: 112.4253, lat: 29.7205, timezone: "+8", alias: ["石首市"] },
  { city: "义乌", country: "中国", province: "浙江", lng: 120.0742, lat: 29.3062, timezone: "+8", alias: ["义乌市"] },
];

for (const e of extras) {
  const rec = { ...e, pinyin: makePinyin(e.city) };
  map.set(keyOf(rec), rec);
}

const result = [...map.values()].sort((a, b) => {
  if (a.country !== b.country) return a.country.localeCompare(b.country, "zh-CN");
  if (a.province !== b.province) return a.province.localeCompare(b.province, "zh-CN");
  return a.city.localeCompare(b.city, "zh-CN");
});

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log(`✓ Wrote ${result.length} cities to ${outPath}`);
