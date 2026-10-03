/** 五行极坐标图：从正上方顺时针 金 → 木 → 水 → 火 → 土（与参考图示一致）。 */

export const WX_POLAR_ORDER = ["金", "木", "水", "火", "土"] as const;
export type WxPolarName = (typeof WX_POLAR_ORDER)[number];

export const WX_POLAR_COLORS: Record<WxPolarName, string> = {
  金: "#A39658",
  木: "#5FA85A",
  水: "#3D8A96",
  火: "#C4453A",
  土: "#C9A227",
};

export const WX_POLAR_LABEL_COLORS: Record<WxPolarName, string> = {
  金: "#8A7E4A",
  木: "#3F7A3C",
  水: "#2A6A74",
  火: "#A3322C",
  土: "#8A6A18",
};

/** SVG 角度：0=东，顺时针为正。-90 为正上方。 */
export const WX_POLAR_START_DEG = -90;
export const WX_POLAR_SLICE_DEG = 72;

export function roundPercents(values: number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((v) => (v / total) * 100);
  const floors = raw.map((v) => Math.floor(v + 1e-9));
  let remain = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v + 1e-9) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  const out = [...floors];
  for (let k = 0; k < remain; k++) out[order[k].i] += 1;
  return out;
}

export function polarPoint(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** 从圆心扫到半径 r 的扇形（sweep=1 在 y 向下的 SVG 里为顺时针）。 */
export function slicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  if (r <= 0.5) return "";
  const a = polarPoint(cx, cy, r, startDeg);
  const b = polarPoint(cx, cy, r, endDeg);
  const delta = ((endDeg - startDeg) % 360 + 360) % 360;
  const large = delta > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`;
}

export type WxPolarSlice = {
  name: WxPolarName;
  value: number;
  percent: number;
  startDeg: number;
  endDeg: number;
  midDeg: number;
  radiusRatio: number;
  color: string;
  labelColor: string;
};

export function buildWxPolarModel(wuXing: {
  木?: number;
  火?: number;
  土?: number;
  金?: number;
  水?: number;
}): WxPolarSlice[] {
  const values = WX_POLAR_ORDER.map((k) => {
    const n = Number(wuXing[k] ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });
  const percents = roundPercents(values);
  const maxPct = Math.max(...percents, 1);
  return WX_POLAR_ORDER.map((name, i) => {
    const midDeg = WX_POLAR_START_DEG + i * WX_POLAR_SLICE_DEG;
    const half = WX_POLAR_SLICE_DEG / 2;
    return {
      name,
      value: values[i],
      percent: percents[i],
      startDeg: midDeg - half,
      endDeg: midDeg + half,
      midDeg,
      radiusRatio: percents[i] / maxPct,
      color: WX_POLAR_COLORS[name],
      labelColor: WX_POLAR_LABEL_COLORS[name],
    };
  });
}

/** 海报饼图：等半径，圆心角 ∝ 占比；从正上方顺时针 金 → 木 → 水 → 火 → 土。 */
export const WX_PIE_ORDER = WX_POLAR_ORDER;
export const WX_PIE_START_DEG = WX_POLAR_START_DEG;
/** 低于此百分比的扇区向外炸开并拉出引导线（参考图 火 4%；9% 的土也会挤在缝里）。 */
export const WX_PIE_EXPLODE_PCT = 12;

export const WX_PIE_COLORS: Record<WxPolarName, string> = {
  金: "#C9A84A",
  木: "#5AAB5A",
  水: "#3D9BB0",
  火: "#C44536",
  土: "#D18A3A",
};

export const WX_LEGEND_ORDER = ["水", "木", "金", "土", "火"] as const;

export const WX_NAME_EN: Record<WxPolarName, string> = {
  金: "Metal",
  木: "Wood",
  水: "Water",
  火: "Fire",
  土: "Earth",
};

export const WX_NAME_PT: Record<WxPolarName, string> = {
  金: "Metal",
  木: "Madeira",
  水: "Água",
  火: "Fogo",
  土: "Terra",
};

export type WxPieSlice = {
  name: WxPolarName;
  value: number;
  percent: number;
  startDeg: number;
  endDeg: number;
  midDeg: number;
  explode: boolean;
  color: string;
};

export function buildWxPieModel(wuXing: {
  木?: number;
  火?: number;
  土?: number;
  金?: number;
  水?: number;
}): WxPieSlice[] {
  const values = WX_PIE_ORDER.map((k) => {
    const n = Number(wuXing[k] ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });
  const percents = roundPercents(values);
  let cursor = WX_PIE_START_DEG;
  return WX_PIE_ORDER.map((name, i) => {
    const percent = percents[i];
    const sweep = (percent / 100) * 360;
    const startDeg = cursor;
    const endDeg = cursor + sweep;
    cursor = endDeg;
    return {
      name,
      value: values[i],
      percent,
      startDeg,
      endDeg,
      midDeg: startDeg + sweep / 2,
      explode: percent > 0 && percent < WX_PIE_EXPLODE_PCT,
      color: WX_PIE_COLORS[name],
    };
  });
}

/** 饼图扇区；满圆用双弧，避免 SVG 起止重合画不出。 */
export function pieSlicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  if (r <= 0.5) return "";
  const rawDelta = endDeg - startDeg;
  if (rawDelta >= 359.5) {
    const a = polarPoint(cx, cy, r, startDeg);
    const b = polarPoint(cx, cy, r, startDeg + 180);
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 1 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} A ${r} ${r} 0 1 1 ${a.x.toFixed(2)} ${a.y.toFixed(2)} Z`;
  }
  const delta = ((rawDelta) % 360 + 360) % 360;
  if (delta < 0.05) return "";
  if (delta >= 359.5) {
    const a = polarPoint(cx, cy, r, startDeg);
    const b = polarPoint(cx, cy, r, startDeg + 180);
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 1 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} A ${r} ${r} 0 1 1 ${a.x.toFixed(2)} ${a.y.toFixed(2)} Z`;
  }
  return slicePath(cx, cy, r, startDeg, endDeg);
}

export type WxBalance = {
  wang: WxPolarName[];
  ci: WxPolarName[];
  ruo: WxPolarName[];
  adviceWx: WxPolarName | null;
  balanced: boolean;
};

/** 旺 ≥22%、次 10–21%、弱 <10%（与参考海报 水36/金22/木20/土18/火4 一致）。 */
export function classifyWxBalance(
  slices: Array<{ name: WxPolarName; percent: number }>,
): WxBalance {
  const wang: WxPolarName[] = [];
  const ci: WxPolarName[] = [];
  const ruo: WxPolarName[] = [];
  const byName = new Map(slices.map((s) => [s.name, s.percent]));
  for (const name of WX_PIE_ORDER) {
    const percent = byName.get(name) ?? 0;
    if (percent >= 22) wang.push(name);
    else if (percent < 10) ruo.push(name);
    else ci.push(name);
  }
  const pct = (n: WxPolarName) => byName.get(n) ?? 0;
  wang.sort((a, b) => pct(b) - pct(a) || a.localeCompare(b, "zh"));
  ci.sort((a, b) => pct(b) - pct(a) || a.localeCompare(b, "zh"));
  ruo.sort((a, b) => pct(a) - pct(b) || a.localeCompare(b, "zh"));
  // 五项都在 10–21 为均衡；0% 算弱，不算均衡。
  const allMid = WX_PIE_ORDER.every((n) => {
    const p = pct(n);
    return p >= 10 && p < 22;
  });
  return {
    wang: allMid ? [] : wang,
    ci: allMid ? [...WX_PIE_ORDER] : ci,
    ruo: allMid ? [] : ruo,
    adviceWx: allMid ? null : (ruo[0] ?? null),
    balanced: allMid,
  };
}

export function joinWxNamesZh(names: WxPolarName[]): string {
  return names.join("、");
}

export function joinWxNamesEn(names: WxPolarName[]): string {
  const labels = names.map((n) => WX_NAME_EN[n]);
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

export function joinWxNamesPt(names: WxPolarName[]): string {
  const labels = names.map((n) => WX_NAME_PT[n]);
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} e ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

export function formatWxBalanceLead(balance: WxBalance, joinNames: (n: WxPolarName[]) => string): string {
  if (balance.balanced) return "";
  const parts: string[] = [];
  if (balance.wang.length) parts.push(`${joinNames(balance.wang)}较旺`);
  if (balance.ci.length) parts.push(`${joinNames(balance.ci)}次之`);
  if (balance.ruo.length) parts.push(`${joinNames(balance.ruo)}偏弱`);
  return parts.join("，");
}
