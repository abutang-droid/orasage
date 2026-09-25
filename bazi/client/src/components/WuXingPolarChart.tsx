import {
  buildWxPolarModel,
  polarPoint,
  slicePath,
} from "@/lib/wuxingPolar";

const VB = 400;
const CX = 200;
const CY = 200;
const R = 188;
const LABEL_ON_FILL = "#F7F3E8";

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

      {slices.map((s) => {
        const sliceR = Math.max(4, s.radiusRatio * R);
        const labelR = sliceR >= R * 0.45 ? sliceR * 0.62 : R * 0.52;
        const p = polarPoint(CX, CY, labelR, s.midDeg);
        const onFill = labelR < sliceR - 10;
        const fill = onFill ? LABEL_ON_FILL : s.labelColor;
        return (
          <text
            key={`${s.name}-lb`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Noto Serif SC', 'Songti SC', serif"
            fill={fill}
          >
            <tspan x={p.x} dy="-0.42em" fontSize={22} fontWeight={600}>
              {s.name}
            </tspan>
            <tspan x={p.x} dy="1.28em" fontSize={14} fontWeight={500}>
              {s.percent}%
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
