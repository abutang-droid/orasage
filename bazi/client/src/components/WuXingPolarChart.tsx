import {
  buildWxPolarModel,
  polarPoint,
  slicePath,
} from "@/lib/wuxingPolar";

const VB = 420;
const CX = 210;
const CY = 210;
const R = 158;
const LABEL_R = R + 36;
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
  className,
}: {
  wuXing: { 木?: number; 火?: number; 土?: number; 金?: number; 水?: number };
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
      style={{ overflow: "visible", display: "block" }}
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

      {slices.map((s) => {
        const p = polarPoint(CX, CY, LABEL_R, s.midDeg);
        const anchor = labelAnchor(s.midDeg);
        const dx = anchor === "start" ? 4 : anchor === "end" ? -4 : 0;
        return (
          <text
            key={`${s.name}-lb`}
            x={p.x + dx}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontFamily="'Noto Serif SC', 'Songti SC', serif"
          >
            <tspan fontSize={24} fontWeight={600} fill={s.labelColor}>
              {s.name}
            </tspan>
            <tspan fontSize={14} fill={s.labelColor} dx={4}>
              {s.percent}%
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
