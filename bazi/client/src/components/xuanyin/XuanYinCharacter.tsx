import type { CharacterMood } from './dialogueScript';

type Props = {
  mood: CharacterMood;
  className?: string;
};

/**
 * 玄隐先生 — 中式道家 SVG（莲花道冠、交领道袍、三缕须）+ 神态
 * idle: 呼吸+眨眼 | listening: 倾身+光环 | thinking: 冒泡 | speaking: 嘴型
 */
export function XuanYinCharacter({ mood, className = '' }: Props) {
  const mouthOpen = mood === 'speaking';
  const lean = mood === 'listening';
  const thinking = mood === 'thinking';

  return (
    <div
      className={`xy-character xy-character--${mood} ${className}`}
      data-mood={mood}
      aria-hidden="true"
    >
      {thinking ? (
        <div className="xy-think-bubble" aria-hidden>
          <span>…</span>
        </div>
      ) : null}

      <div className={`xy-halo ${mood === 'listening' ? 'xy-halo--pulse' : ''}`} />

      <svg
        className={`xy-avatar ${lean ? 'xy-avatar--lean' : ''} ${mood === 'idle' ? 'xy-avatar--breathe' : ''}`}
        viewBox="0 0 220 300"
        width="200"
        height="272"
        role="img"
        aria-label="玄隐先生"
      >
        <defs>
          <radialGradient id="xyFaceGlow" cx="48%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#fff6ec" />
            <stop offset="70%" stopColor="#f0dcc8" />
            <stop offset="100%" stopColor="#e2c4a8" />
          </radialGradient>
          <linearGradient id="xyRobe" x1="0%" y1="0%" x2="18%" y2="100%">
            <stop offset="0%" stopColor="#3a4a5c" />
            <stop offset="45%" stopColor="#243040" />
            <stop offset="100%" stopColor="#151c26" />
          </linearGradient>
          <linearGradient id="xyRobeInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3e6d0" />
            <stop offset="100%" stopColor="#d8c3a0" />
          </linearGradient>
          <linearGradient id="xyAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8944a" />
            <stop offset="50%" stopColor="#e8d5a3" />
            <stop offset="100%" stopColor="#b8944a" />
          </linearGradient>
          <linearGradient id="xyHair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a2430" />
            <stop offset="100%" stopColor="#121018" />
          </linearGradient>
          <linearGradient id="xyCrown" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2f3540" />
            <stop offset="100%" stopColor="#1a1e26" />
          </linearGradient>
        </defs>

        {/* 道袍下摆 */}
        <path
          d="M28 138 C42 112 68 104 110 104 C152 104 178 112 192 138 L208 292 L12 292 Z"
          fill="url(#xyRobe)"
        />
        {/* 袖口 */}
        <path d="M28 138 C18 168 14 210 22 255 L48 248 C42 210 40 170 48 142 Z" fill="#1c2430" />
        <path d="M192 138 C202 168 206 210 198 255 L172 248 C178 210 180 170 172 142 Z" fill="#1c2430" />

        {/* 中缝金绦 */}
        <path d="M110 118 L110 292" stroke="url(#xyAccent)" strokeWidth="1.4" opacity="0.65" />
        {/* 交领右衽 */}
        <path
          d="M78 118 L110 152 L142 118"
          fill="none"
          stroke="#c9a86c"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M86 122 L110 146 L134 122" fill="url(#xyRobeInner)" opacity="0.85" />
        {/* 领缘暗纹 */}
        <path
          d="M90 128 L110 148 L130 128"
          fill="none"
          stroke="#8a7348"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* 腰间绦带 + 玉佩 */}
        <path d="M62 198 H158" stroke="#c9a86c" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
        <path d="M110 198 L110 232" stroke="#c9a86c" strokeWidth="1.2" opacity="0.7" />
        <ellipse cx="110" cy="240" rx="9" ry="12" fill="#dce8e0" stroke="#8a9a88" strokeWidth="1.2" />
        <path d="M110 228 L110 252" stroke="#6a7a68" strokeWidth="0.8" opacity="0.6" />
        <circle cx="110" cy="240" r="2.2" fill="#9bb09a" />

        {/* 肩披 / 云肩感 */}
        <path
          d="M48 128 C70 118 90 114 110 114 C130 114 150 118 172 128 L162 148 C142 136 128 132 110 132 C92 132 78 136 58 148 Z"
          fill="#2a3340"
          opacity="0.55"
        />

        {/* 束发 / 鬓发 */}
        <ellipse cx="110" cy="86" rx="44" ry="48" fill="url(#xyHair)" />
        <path d="M66 90 Q58 120 62 148" fill="none" stroke="#1a1520" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
        <path d="M154 90 Q162 120 158 148" fill="none" stroke="#1a1520" strokeWidth="10" strokeLinecap="round" opacity="0.35" />

        {/* 面部 */}
        <ellipse cx="110" cy="96" rx="36" ry="40" fill="url(#xyFaceGlow)" />
        {/* 耳 */}
        <ellipse cx="74" cy="100" rx="7" ry="11" fill="#e8cbb4" />
        <ellipse cx="146" cy="100" rx="7" ry="11" fill="#e8cbb4" />

        {/* 莲花道冠 */}
        <path
          d="M78 62 C82 36 96 24 110 22 C124 24 138 36 142 62 L132 68 C128 48 118 40 110 38 C102 40 92 48 88 68 Z"
          fill="url(#xyCrown)"
        />
        {/* 冠梁 */}
        <path d="M92 52 L110 30 L128 52" fill="none" stroke="#c9a86c" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M98 56 L110 40 L122 56" fill="none" stroke="#e8d5a3" strokeWidth="0.9" opacity="0.7" />
        {/* 冠顶宝珠 */}
        <circle cx="110" cy="26" r="5" fill="url(#xyAccent)" />
        <circle cx="110" cy="26" r="2.2" fill="#fff8e8" opacity="0.85" />
        {/* 冠额饰 */}
        <rect x="100" y="58" width="20" height="8" rx="2" fill="#c9a86c" />
        <circle cx="110" cy="62" r="2.5" fill="#2a2430" />
        {/* 发髻两侧簪 */}
        <line x1="86" y1="48" x2="74" y2="40" stroke="#c9a86c" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="134" y1="48" x2="146" y2="40" stroke="#c9a86c" strokeWidth="1.4" strokeLinecap="round" />

        {/* 眉 — 清癯温润 */}
        <path d="M90 90 Q97 85 104 90" fill="none" stroke="#3a3040" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M116 90 Q123 85 130 90" fill="none" stroke="#3a3040" strokeWidth="1.7" strokeLinecap="round" />

        {/* 眼 */}
        <ellipse className="xy-eye" cx="97" cy="98" rx="3.4" ry="4" fill="#1e1a28" />
        <ellipse className="xy-eye" cx="123" cy="98" rx="3.4" ry="4" fill="#1e1a28" />
        <circle cx="98.2" cy="96.8" r="1.1" fill="#fff" opacity="0.75" />
        <circle cx="124.2" cy="96.8" r="1.1" fill="#fff" opacity="0.75" />

        {/* 鼻 */}
        <path
          d="M110 102 L107 114 Q110 116 113 114 Z"
          fill="none"
          stroke="#c4a088"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        {/* 嘴 — speaking 开合 */}
        <ellipse
          className={`xy-mouth ${mouthOpen ? 'xy-mouth--open' : ''}`}
          cx="110"
          cy="124"
          rx={mouthOpen ? 7.5 : 6.5}
          ry={mouthOpen ? 4.8 : 1.9}
          fill={mouthOpen ? "#6b3a45" : "#b08978"}
        />

        {/* 三缕须 */}
        <path
          d="M104 130 Q100 148 98 168"
          fill="none"
          stroke="#5a4a40"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M110 132 Q110 152 110 176"
          fill="none"
          stroke="#6a5848"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M116 130 Q120 148 122 168"
          fill="none"
          stroke="#5a4a40"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.75"
        />
        {/* 颊须淡影 */}
        <path
          d="M86 118 Q92 128 98 126"
          fill="none"
          stroke="#8a7060"
          strokeWidth="0.9"
          opacity="0.4"
        />
        <path
          d="M134 118 Q128 128 122 126"
          fill="none"
          stroke="#8a7060"
          strokeWidth="0.9"
          opacity="0.4"
        />
      </svg>

      {mood === 'listening' ? (
        <p className="xy-mood-label">聆听中</p>
      ) : mood === 'thinking' ? (
        <p className="xy-mood-label">思考中</p>
      ) : null}
    </div>
  );
}
