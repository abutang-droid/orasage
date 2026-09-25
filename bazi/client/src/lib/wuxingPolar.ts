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
