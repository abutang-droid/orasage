/**
 * 首页产品磁贴插画（纯 SVG，替代真实塔罗牌面）。
 * 依据设计稿：金属球 + 磁力线 / 球体穿透玻璃切面 / 神经网络链条 / 玻璃罩烛台。
 * 均为灰阶线描 + 金属渐变，适配浅色卡片背景。
 */

function SphereGradient({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="38%" cy="32%" r="78%">
      <stop offset="0%" stopColor="#fafafa" />
      <stop offset="30%" stopColor="#cbc9c4" />
      <stop offset="66%" stopColor="#8b8882" />
      <stop offset="100%" stopColor="#474540" />
    </radialGradient>
  );
}

/** 今日启示：金属球 + 偶极磁力线 + 连接节点 */
export function DailyInsightGlyph() {
  return (
    <svg className="home-tile-glyph" viewBox="0 0 168 120" fill="none" aria-hidden>
      <defs>
        <SphereGradient id="glyph-daily-sphere" />
      </defs>

      {/* 磁力线：环绕球体的流线 */}
      <g stroke="#c0bdb6" strokeWidth="1" opacity="0.7" fill="none">
        <path d="M74 46C48 30 30 34 34 52C38 70 54 74 78 62" />
        <path d="M72 42C40 22 16 30 24 54C31 74 52 82 82 66" opacity="0.75" />
        <path d="M70 40C34 16 6 30 16 58C25 82 52 90 84 70" opacity="0.5" />
        <path d="M94 74C120 90 138 86 134 68C130 50 114 46 90 58" />
        <path d="M96 78C128 98 152 90 144 66C137 46 116 38 86 54" opacity="0.75" />
        <path d="M98 80C134 104 162 90 152 62C143 38 116 30 84 50" opacity="0.5" />
      </g>

      {/* 左向淡箭头 */}
      <g stroke="#b8b5ae" strokeWidth="1.4" fill="none" opacity="0.8">
        <path d="M64 82C48 84 38 82 30 88" />
        <path d="M36 84L28 88L36 92" />
      </g>

      {/* 连接线：贯穿球体的 S 形 + 右侧支线 */}
      <path
        d="M40 96C58 92 66 74 84 60C100 48 116 40 132 30"
        stroke="#565450"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M92 62C108 66 120 66 130 66"
        stroke="#565450"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <circle cx="84" cy="60" r="23" fill="url(#glyph-daily-sphere)" />

      {/* 节点 */}
      <circle cx="38" cy="97" r="6" fill="#ffffff" stroke="#565450" strokeWidth="1.6" />
      <circle cx="136" cy="28" r="6" fill="#ffffff" stroke="#565450" strokeWidth="1.6" />
      <circle cx="134" cy="66" r="6" fill="#8b8882" stroke="#565450" strokeWidth="1.2" />
    </svg>
  );
}

/** 定命切片：金属球穿透三块玻璃切面 + 虚线视轴 */
export function DestinySliceGlyph() {
  const panel = (x: number, opacity: number) => (
    <path
      d={`M${x} 30L${x + 26} 20L${x + 26} 96L${x} 106Z`}
      fill="#ffffff"
      fillOpacity={opacity}
      stroke="#c7c4bd"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  );

  return (
    <svg className="home-tile-glyph" viewBox="0 0 168 120" fill="none" aria-hidden>
      <defs>
        <SphereGradient id="glyph-slice-sphere" />
      </defs>

      {panel(20, 0.55)}
      {panel(110, 0.55)}
      {panel(65, 0.7)}

      {/* 虚线视轴：以球心为焦点发散 */}
      <g stroke="#a8a59e" strokeWidth="1.1" strokeDasharray="5 5" opacity="0.85">
        <path d="M8 62H160" />
        <path d="M10 46L158 78" />
        <path d="M10 78L158 46" />
      </g>

      <circle cx="86" cy="62" r="25" fill="url(#glyph-slice-sphere)" />
    </svg>
  );
}

/** 脉络解构：多输入 → 中枢节点 → 三输出的链条网络 */
export function TrilogyNetworkGlyph() {
  const inputs = [16, 38, 60, 82, 104];
  const outputs = [30, 60, 90];
  return (
    <svg className="home-tile-glyph" viewBox="0 0 172 120" fill="none" aria-hidden>
      <defs>
        <marker id="glyph-net-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0 0L6 3L0 6" fill="none" stroke="#8f8c86" strokeWidth="1" />
        </marker>
        <marker id="glyph-net-arrow-in" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0 0L6 3L0 6" fill="none" stroke="#c0bdb6" strokeWidth="1" />
        </marker>
      </defs>

      {/* 输入 → 中枢 */}
      <g stroke="#c8c5be" strokeWidth="1.1" fill="none">
        {inputs.map((y) => (
          <line
            key={y}
            x1="24"
            y1={y}
            x2="62"
            y2="60"
            markerEnd="url(#glyph-net-arrow-in)"
          />
        ))}
      </g>

      {/* 中枢 → 输出（正交折线） */}
      <g stroke="#8f8c86" strokeWidth="1.3" fill="none">
        <path d="M104 54L124 30L150 30" markerEnd="url(#glyph-net-arrow)" />
        <path d="M108 60H150" markerEnd="url(#glyph-net-arrow)" />
        <path d="M104 66L124 90L150 90" markerEnd="url(#glyph-net-arrow)" />
      </g>

      {/* 输入节点 */}
      {inputs.map((y) => (
        <circle key={y} cx="16" cy={y} r="7.5" fill="#ffffff" stroke="#8f8c86" strokeWidth="1.3" />
      ))}

      {/* 中枢双环 */}
      <circle cx="86" cy="60" r="15" fill="#ffffff" stroke="#6f6c66" strokeWidth="1.4" />
      <circle cx="86" cy="60" r="8.5" fill="none" stroke="#6f6c66" strokeWidth="1.4" />

      {/* 输出节点 */}
      {outputs.map((y) => (
        <circle key={y} cx="158" cy={y} r="9.5" fill="#ffffff" stroke="#6f6c66" strokeWidth="1.4" />
      ))}
    </svg>
  );
}

/** 祈福：金属底座上的玻璃罩烛台 */
export function BlessingDomeGlyph() {
  return (
    <svg className="home-tile-glyph" viewBox="0 0 120 150" fill="none" aria-hidden>
      <defs>
        <linearGradient id="glyph-dome-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8f8c86" />
          <stop offset="50%" stopColor="#6f6c66" />
          <stop offset="100%" stopColor="#4c4a45" />
        </linearGradient>
        <linearGradient id="glyph-dome-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#e9e7e2" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="glyph-candle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f1efea" />
          <stop offset="100%" stopColor="#d9d7d1" />
        </linearGradient>
      </defs>

      {/* 金属底座 */}
      <ellipse cx="60" cy="138" rx="44" ry="9" fill="#3f3d39" />
      <rect x="16" y="118" width="88" height="20" rx="4" fill="url(#glyph-dome-base)" />
      <ellipse cx="60" cy="118" rx="44" ry="9" fill="#7a7772" />
      <rect x="22" y="110" width="76" height="12" rx="3" fill="url(#glyph-dome-base)" opacity="0.9" />
      <ellipse cx="60" cy="110" rx="38" ry="7" fill="#8b8882" />
      {/* 白色托盘 */}
      <ellipse cx="60" cy="108" rx="32" ry="5.5" fill="#f4f2ee" />

      {/* 蜡烛 */}
      <rect x="46" y="66" width="28" height="42" rx="2" fill="url(#glyph-candle)" />
      <ellipse cx="60" cy="66" rx="14" ry="4" fill="#ffffff" />
      <ellipse cx="60" cy="108" rx="14" ry="4" fill="#e4e2dc" />

      {/* 烛芯 + 火焰 */}
      <line x1="60" y1="56" x2="60" y2="66" stroke="#3f3d39" strokeWidth="1.6" />
      <path
        d="M60 30C68 40 70 48 64 55C61 58 59 58 56 55C50 48 52 40 60 30Z"
        fill="#fbfaf7"
        stroke="#c7c4bd"
        strokeWidth="1"
      />

      {/* 玻璃罩 */}
      <path
        d="M26 112L26 62C26 30 44 14 60 14C76 14 94 30 94 62L94 112"
        fill="url(#glyph-dome-glass)"
        stroke="#c4c1ba"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M36 100L36 60C36 40 44 28 52 24" stroke="#ffffff" strokeWidth="1.4" opacity="0.6" fill="none" />
    </svg>
  );
}
