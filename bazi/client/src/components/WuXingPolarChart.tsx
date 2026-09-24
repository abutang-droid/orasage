import {
  buildWxPolarModel,
  polarPoint,
  slicePath,
  type WxPolarPillars,
} from "@/lib/wuxingPolar";

const VB = 400;
const CX = 200;
const CY = 206;
const R = 112;
const RINGS = 5;
const SPOKES = 12;

function labelAnchor(deg: number): "start" | "middle" | "end" {
  const c = Math.cos((deg * Math.PI) / 180);
  if (c > 0.35) return "start";
  if (c < -0.35) return "end";
  return "middle";
}

export function WuXingPolarChart({
  wuXing,
  pillars,
  className,
}: {
  wuXing: { 木?: number; 火?: number; 土?: number; 金?: number; 水?: number };
  pillars?: WxPolarPillars;
  className?: string;
}) {
  const slices = buildWxPolarModel(wuXing);
  const summary = slices.map((s) => `${s.name}${s.percent}%`).join("、");

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB} ${VB}`}
      width="100%"
      role="img"
      aria-label={`五行分布 ${summary}`}
      style={{ maxWidth: 360, overflow: "visible", display: "block", margin: "0 auto" }}
    >
      {slices.map((s) => {
        const r = Math.max(4, s.radiusRatio * R);
        const d = slicePath(CX, CY, r, s.startDeg, s.endDeg);
        if (!d) return null;
        return <path key={s.name} d={d} fill={s.color} opacity={0.92} />;
      })}

      {Array.from({ length: RINGS }, (_, i) => {
        const rr = ((i + 1) / RINGS) * R;
        return (
          <circle
            key={rr}
            cx={CX}
            cy={CY}
            r={rr}
            fill="none"
            stroke="#C8C8C8"
            strokeWidth={1}
          />
        );
      })}
      {Array.from({ length: SPOKES }, (_, i) => {
        const deg = -90 + i * (360 / SPOKES);
        const p = polarPoint(CX, CY, R, deg);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="#C8C8C8"
            strokeWidth={1}
          />
        );
      })}

      {pillars && (
        <>
          <rect
            x={CX - 56}
            y={CY - 30}
            width={112}
            height={60}
            rx={10}
            fill="rgba(255,255,255,0.94)"
          />
          <text
            x={CX}
            y={CY - 6}
            textAnchor="middle"
            fontFamily="'Noto Serif SC', 'Songti SC', serif"
            fontSize={16}
            fontWeight={600}
            fill="#1a1a1a"
          >
            {pillars.year}　{pillars.month}
          </text>
          <text
            x={CX}
            y={CY + 16}
            textAnchor="middle"
            fontFamily="'Noto Serif SC', 'Songti SC', serif"
            fontSize={16}
            fontWeight={600}
            fill="#1a1a1a"
          >
            {pillars.day}　{pillars.hour}
          </text>
        </>
      )}

      {slices.map((s) => {
        const p = polarPoint(CX, CY, R + 44, s.midDeg);
        const anchor = labelAnchor(s.midDeg);
        const dx = anchor === "start" ? 6 : anchor === "end" ? -6 : 0;
        return (
          <text
            key={`${s.name}-lb`}
            x={p.x + dx}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontFamily="'Noto Serif SC', 'Songti SC', serif"
          >
            <tspan fontSize={22} fontWeight={600} fill={s.labelColor}>
              {s.name}
            </tspan>
            <tspan fontSize={13} fill={s.labelColor} dx={4}>
              {s.percent}%
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

export function pillarsFromBazi(result: {
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
}): WxPolarPillars {
  return {
    year: `${result.year.gan}${result.year.zhi}`,
    month: `${result.month.gan}${result.month.zhi}`,
    day: `${result.day.gan}${result.day.zhi}`,
    hour: `${result.hour.gan}${result.hour.zhi}`,
  };
}
