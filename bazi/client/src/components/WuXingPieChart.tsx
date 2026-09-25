import {
  buildWxPieModel,
  pieSlicePath,
  polarPoint,
  type WxPieSlice,
} from "@/lib/wuxingPolar";

const VB_W = 480;
const VB_H = 420;
const CX = 240;
const CY = 210;
const R = 142;
const EXPLODE = 26;
const CREAM = "#FBF7EE";

function sliceCenter(s: WxPieSlice): { x: number; y: number } {
  if (!s.explode) return { x: CX, y: CY };
  return polarPoint(CX, CY, EXPLODE, s.midDeg);
}

function overlayFor(name: WxPieSlice["name"], clipId: string) {
  if (name === "金") {
    return (
      <g clipPath={`url(#${clipId})`} opacity={0.22} fill="none" stroke="#F7F3E8" strokeWidth={1.4}>
        <path d="M 140 175 L 175 128 L 205 168 L 230 118 L 268 172 L 300 140 L 340 190" />
        <path d="M 155 210 L 190 168 L 220 205 L 250 160 L 290 210" />
      </g>
    );
  }
  if (name === "水") {
    return (
      <g clipPath={`url(#${clipId})`} opacity={0.28} fill="none" stroke="#F7F3E8" strokeWidth={1.3}>
        <path d="M 150 250 Q 190 235 230 250 Q 270 265 310 248" />
        <path d="M 145 272 Q 190 257 235 272 Q 280 287 325 270" />
        <path d="M 155 294 Q 200 280 245 294 Q 290 308 330 292" />
      </g>
    );
  }
  if (name === "土") {
    return (
      <g clipPath={`url(#${clipId})`} opacity={0.2} fill="none" stroke="#F7F3E8" strokeWidth={1.3}>
        <path d="M 90 160 Q 130 140 170 165 Q 200 185 155 210 Q 110 195 90 160" />
      </g>
    );
  }
  if (name === "木") {
    return (
      <g clipPath={`url(#${clipId})`} opacity={0.18} fill="none" stroke="#F7F3E8" strokeWidth={1.2}>
        <path d="M 280 120 Q 310 160 300 210" />
        <path d="M 300 150 Q 330 155 345 140" />
        <path d="M 298 175 Q 335 185 348 170" />
      </g>
    );
  }
  return null;
}

export function WuXingPieChart({
  wuXing,
  className,
}: {
  wuXing: { 木?: number; 火?: number; 土?: number; 金?: number; 水?: number };
  className?: string;
}) {
  const slices = buildWxPieModel(wuXing);
  const summary = slices.map((s) => `${s.name}${s.percent}%`).join("、");

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      role="img"
      aria-label={`五行分布 ${summary}`}
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        {slices.map((s) => {
          if (s.percent <= 0) return null;
          const c = sliceCenter(s);
          const d = pieSlicePath(c.x, c.y, R, s.startDeg, s.endDeg);
          if (!d) return null;
          return (
            <clipPath key={`clip-${s.name}`} id={`wx-pie-clip-${s.name}`}>
              <path d={d} />
            </clipPath>
          );
        })}
      </defs>

      {slices.map((s) => {
        if (s.percent <= 0) return null;
        const c = sliceCenter(s);
        const d = pieSlicePath(c.x, c.y, R, s.startDeg, s.endDeg);
        if (!d) return null;
        return (
          <g key={s.name}>
            <path d={d} fill={s.color} stroke={CREAM} strokeWidth={3.2} strokeLinejoin="round" />
            {overlayFor(s.name, `wx-pie-clip-${s.name}`)}
          </g>
        );
      })}

      {slices.map((s) => {
        if (s.percent <= 0) return null;
        const c = sliceCenter(s);
        if (s.explode) {
          const edge = polarPoint(c.x, c.y, R + 2, s.midDeg);
          const elbow = polarPoint(c.x, c.y, R + 22, s.midDeg);
          const lab = polarPoint(c.x, c.y, R + 48, s.midDeg);
          return (
            <g key={`${s.name}-lb`}>
              <polyline
                points={`${edge.x.toFixed(1)},${edge.y.toFixed(1)} ${elbow.x.toFixed(1)},${elbow.y.toFixed(1)} ${lab.x.toFixed(1)},${lab.y.toFixed(1)}`}
                fill="none"
                stroke={s.color}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x={lab.x}
                y={lab.y}
                textAnchor={lab.x < CX ? "end" : "start"}
                dominantBaseline="middle"
                fontFamily="'Noto Serif SC', 'Songti SC', serif"
                fill={s.color}
              >
                <tspan x={lab.x} dy="-0.45em" fontSize={16} fontWeight={600}>
                  {s.name}
                </tspan>
                <tspan x={lab.x} dy="1.25em" fontSize={13} fontWeight={500}>
                  {s.percent}%
                </tspan>
              </text>
            </g>
          );
        }
        const sweep = s.endDeg - s.startDeg;
        const labelR = sweep < 40 ? R * 0.62 : R * 0.52;
        const p = polarPoint(c.x, c.y, labelR, s.midDeg);
        return (
          <text
            key={`${s.name}-lb`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Noto Serif SC', 'Songti SC', serif"
            fill="#F7F3E8"
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
