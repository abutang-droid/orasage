import type { CityCoords, CityRecord } from "./types";

function isChinese(ch: string): boolean {
  return /[\u4e00-\u9fff]/.test(ch);
}

/** 本地精确/模糊匹配（与 bazi 原 cityData 逻辑一致） */
export function matchLocalCity(data: CityRecord[], query: string): CityRecord | null {
  const q = query.trim();
  if (!q) return null;

  let found = data.find((c) => c.city === q);
  if (!found) found = data.find((c) => c.alias?.includes(q));
  if (!found) found = data.find((c) => c.city.includes(q));
  if (!found) {
    found = data.find((c) => {
      if (!c.city || c.city.length < 2) return false;
      if (!q.includes(c.city)) return false;
      const idx = q.indexOf(c.city);
      const before = idx > 0 ? q[idx - 1] : "";
      const after = idx + c.city.length < q.length ? q[idx + c.city.length] : "";
      if (isChinese(before) || isChinese(after)) return false;
      return true;
    });
  }
  if (!found) found = data.find((c) => c.alias?.some((a) => a.includes(q) || q.includes(a)));
  if (!found && /^[A-Za-z]+$/.test(q)) {
    const upper = q.toUpperCase();
    found = data.find((c) => c.pinyin === upper);
    if (!found) found = data.find((c) => c.pinyin?.startsWith(upper));
  }
  return found ?? null;
}

export function searchCities(data: CityRecord[], query: string, limit = 8): CityRecord[] {
  const q = query.trim();
  if (!q || data.length === 0) return [];

  const qUpper = q.toUpperCase();
  const isAllAlpha = /^[A-Za-z]+$/.test(q);

  type Scored = { record: CityRecord; score: number };
  const scored: Scored[] = [];

  for (const c of data) {
    let score = 0;
    const py = (c.pinyin || "").toUpperCase();

    if (isAllAlpha) {
      if (py === qUpper) score = 10;
      else if (py.startsWith(qUpper)) score = 8;
      else if (c.alias?.some((a) => a.toLowerCase().startsWith(q.toLowerCase()))) score = 6;
      else if (c.alias?.some((a) => a.toLowerCase().includes(q.toLowerCase()))) score = 3;
    } else {
      if (c.city === q) score = 10;
      else if (c.alias?.includes(q)) score = 9;
      else if (c.city.startsWith(q)) score = 7;
      else if (c.city.includes(q)) score = 5;
      else if (c.alias?.some((a) => a.includes(q))) score = 4;
      else if (c.province?.includes(q)) score = 2;
    }

    if (score > 0) scored.push({ record: c, score });
  }

  scored.sort((a, b) => b.score - a.score || a.record.city.length - b.record.city.length);
  return scored.slice(0, limit).map((s) => s.record);
}

export function toCityCoords(record: CityRecord): CityCoords {
  return {
    city: record.city,
    province: record.province,
    country: record.country,
    lng: record.lng,
    lat: record.lat,
    timezone: record.timezone || "+8",
  };
}

export function cityRecordKey(record: Pick<CityRecord, "city" | "province" | "country">): string {
  return `${record.country}|${record.province}|${record.city}`;
}

export function mergeCityRecords(seed: CityRecord[], overrides: CityRecord[]): CityRecord[] {
  const map = new Map<string, CityRecord>();
  for (const c of seed) map.set(cityRecordKey(c), c);
  for (const c of overrides) map.set(cityRecordKey(c), c);
  return Array.from(map.values());
}
