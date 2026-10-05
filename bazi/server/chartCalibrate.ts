/** 本地 calcSingleBazi 排出四柱/五行后，用网络 AI 校准；页面以校准结果为准。 */

export const STEM = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const BRANCH = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const WX_KEYS = ["木", "火", "土", "金", "水"] as const;

const STEM_SET = new Set<string>(STEM);
const BRANCH_SET = new Set<string>(BRANCH);

export type ChartPillar = { gan: string; zhi: string };

export type CalibratedChart = {
  year: ChartPillar;
  month: ChartPillar;
  day: ChartPillar;
  hour: ChartPillar;
  wuXing: Record<string, number>;
  riZhu: string;
};

export function isStem(value: string): boolean {
  return STEM_SET.has(value);
}

export function isBranch(value: string): boolean {
  return BRANCH_SET.has(value);
}

export function parsePillar(raw: unknown): ChartPillar | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    const compact = raw.replace(/\s+/g, "");
    if (compact.length >= 2 && isStem(compact[0]) && isBranch(compact[1])) {
      return { gan: compact[0], zhi: compact[1] };
    }
    return null;
  }
  if (typeof raw === "object") {
    const gan = String((raw as { gan?: unknown }).gan ?? "").trim();
    const zhi = String((raw as { zhi?: unknown }).zhi ?? "").trim();
    if (isStem(gan) && isBranch(zhi)) return { gan, zhi };
  }
  return null;
}

export function parseWuXing(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== "object") return null;
  const src = raw as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const key of WX_KEYS) {
    const n = Number(src[key]);
    if (!Number.isFinite(n) || n < 0) return null;
    out[key] = Math.round(n * 100) / 100;
  }
  if (WX_KEYS.every((k) => out[k] === 0)) return null;
  return out;
}

export function parseRiZhu(raw: unknown, day?: ChartPillar | null): string | null {
  const text = String(raw ?? "").trim();
  if (text && isStem(text[0])) return text[0];
  if (day?.gan && isStem(day.gan)) return day.gan;
  return null;
}

function readPillar(data: Record<string, unknown>, key: string): ChartPillar {
  return parsePillar(data[key]) ?? { gan: "", zhi: "" };
}

export function localChartFromResult(data: Record<string, unknown>): CalibratedChart {
  const source = (data.person1 && typeof data.person1 === "object")
    ? data.person1 as Record<string, unknown>
    : data;
  const year = readPillar(source, "year");
  const month = readPillar(source, "month");
  const day = readPillar(source, "day");
  const hour = readPillar(source, "hour");
  const wuXing = parseWuXing(source.wuXing) ?? parseWuXing(data.wuXing) ?? {
    木: 0, 火: 0, 土: 0, 金: 0, 水: 0,
  };
  const riZhu = parseRiZhu(source.riZhu ?? data.riZhu, day) ?? "";
  return { year, month, day, hour, wuXing, riZhu };
}

export function applyCalibratedChart(
  data: Record<string, unknown>,
  chart: CalibratedChart | null | undefined,
): Record<string, unknown> {
  if (!chart) return data;
  const patch = {
    year: chart.year,
    month: chart.month,
    day: chart.day,
    hour: chart.hour,
    wuXing: chart.wuXing,
    riZhu: chart.riZhu,
  };
  const next: Record<string, unknown> = { ...data, ...patch };
  if (data.person1 && typeof data.person1 === "object") {
    next.person1 = { ...(data.person1 as Record<string, unknown>), ...patch };
  }
  return next;
}

/** 从模型原文抽出 JSON；字段不合法时回退本地盘。 */
export function parseCalibratedChart(
  raw: string,
  local: CalibratedChart,
): { note: string; chart: CalibratedChart } {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { note: raw.trim(), chart: local };
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    return { note: raw.trim(), chart: local };
  }
  const year = parsePillar(parsed.year) ?? local.year;
  const month = parsePillar(parsed.month) ?? local.month;
  const day = parsePillar(parsed.day) ?? local.day;
  const hour = parsePillar(parsed.hour) ?? local.hour;
  const wuXing = parseWuXing(parsed.wuXing) ?? local.wuXing;
  const riZhu = parseRiZhu(parsed.riZhu, day) ?? local.riZhu;
  const note = String(parsed.note ?? parsed.report ?? parsed.content ?? "").trim();
  return {
    note: note || raw.replace(jsonMatch[0], "").trim(),
    chart: { year, month, day, hour, wuXing, riZhu },
  };
}
