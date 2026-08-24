import type { CharacterMood } from './dialogueScript';

type Props = {
  mood: CharacterMood;
  className?: string;
};

/**
 * 玄隐先生 — 仙风道家 SVG
 * 莲花道冠 + 太极冠饰、交领道袍、长白须、岁月面纹
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
        viewBox="0 0 220 320"
        width="200"
        height="290"
        role="img"
        aria-label="玄隐先生"
      >
        <defs>
          <radialGradient id="xyFaceGlow" cx="48%" cy="36%" r="58%">
            <stop offset="0%" stopColor="#fff8f0" />
            <stop offset="55%" stopColor="#edd4bc" />
            <stop offset="100%" stopColor="#d9b89a" />
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
            <stop offset="0%" stopColor="#f2efe8" />
            <stop offset="40%" stopColor="#d8d2c4" />
            <stop offset="100%" stopColor="#9a9488" />
          </linearGradient>
          <linearGradient id="xyCrown" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2f3540" />
            <stop offset="100%" stopColor="#1a1e26" />
          </linearGradient>
          <linearGradient id="xyBeard" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f7f4ee" />
            <stop offset="55%" stopColor="#e4ddd0" />
            <stop offset="100%" stopColor="#b8b0a0" />
          </linearGradient>
        </defs>

        {/* 道袍 */}
        <path
          d="M28 148 C42 122 68 114 110 114 C152 114 178 122 192 148 L208 312 L12 312 Z"
          fill="url(#xyRobe)"
        />
        <path d="M28 148 C18 178 14 220 22 265 L48 258 C42 220 40 180 48 152 Z" fill="#1c2430" />
        <path d="M192 148 C202 178 206 220 198 265 L172 258 C178 220 180 180 172 152 Z" fill="#1c2430" />
        <path d="M110 128 L110 312" stroke="url(#xyAccent)" strokeWidth="1.4" opacity="0.65" />
        <path
          d="M78 128 L110 162 L142 128"
          fill="none"
          stroke="#c9a86c"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M86 132 L110 156 L134 132" fill="url(#xyRobeInner)" opacity="0.85" />
        <path
          d="M90 138 L110 158 L130 138"
          fill="none"
          stroke="#8a7348"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* 腰绦 + 玉佩 */}
        <path d="M62 208 H158" stroke="#c9a86c" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
        <path d="M110 208 L110 242" stroke="#c9a86c" strokeWidth="1.2" opacity="0.7" />
        <ellipse cx="110" cy="250" rx="9" ry="12" fill="#dce8e0" stroke="#8a9a88" strokeWidth="1.2" />
        <path d="M110 238 L110 262" stroke="#6a7a68" strokeWidth="0.8" opacity="0.6" />
        <circle cx="110" cy="250" r="2.2" fill="#9bb09a" />

        {/* 云肩 */}
        <path
          d="M48 138 C70 128 90 124 110 124 C130 124 150 128 172 138 L162 158 C142 146 128 142 110 142 C92 142 78 146 58 158 Z"
          fill="#2a3340"
          opacity="0.55"
        />

        {/* 银白鬓发 */}
        <ellipse cx="110" cy="90" rx="46" ry="50" fill="url(#xyHair)" />
        <path
          d="M64 94 Q54 128 58 162"
          fill="none"
          stroke="#d8d2c4"
          strokeWidth="11"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M156 94 Q166 128 162 162"
          fill="none"
          stroke="#d8d2c4"
          strokeWidth="11"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* 面部 */}
        <ellipse cx="110" cy="100" rx="37" ry="41" fill="url(#xyFaceGlow)" />
        <ellipse cx="73" cy="104" rx="7" ry="11" fill="#e0bfa4" />
        <ellipse cx="147" cy="104" rx="7" ry="11" fill="#e0bfa4" />

        {/* 岁月痕迹：额纹、眼角纹、法令纹 */}
        <path d="M92 78 Q110 74 128 78" fill="none" stroke="#c4a088" strokeWidth="1.1" opacity="0.55" />
        <path d="M96 84 Q110 81 124 84" fill="none" stroke="#c4a088" strokeWidth="0.9" opacity="0.4" />
        <path d="M84 102 Q80 108 84 112" fill="none" stroke="#c4a088" strokeWidth="0.85" opacity="0.5" />
        <path d="M136 102 Q140 108 136 112" fill="none" stroke="#c4a088" strokeWidth="0.85" opacity="0.5" />
        <path d="M98 118 Q104 124 108 128" fill="none" stroke="#c4a088" strokeWidth="0.9" opacity="0.45" />
        <path d="M122 118 Q116 124 112 128" fill="none" stroke="#c4a088" strokeWidth="0.9" opacity="0.45" />
        {/* 淡斑 / 岁月气色 */}
        <circle cx="88" cy="112" r="1.6" fill="#c89a7e" opacity="0.35" />
        <circle cx="130" cy="110" r="1.3" fill="#c89a7e" opacity="0.3" />
        <circle cx="118" cy="86" r="1.1" fill="#c89a7e" opacity="0.28" />

        {/* 莲花道冠 */}
        <path
          d="M76 66 C80 36 96 22 110 20 C124 22 140 36 144 66 L134 72 C130 50 120 40 110 38 C100 40 90 50 86 72 Z"
          fill="url(#xyCrown)"
        />
        <path d="M92 54 L110 28 L128 54" fill="none" stroke="#c9a86c" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M98 58 L110 38 L122 58" fill="none" stroke="#e8d5a3" strokeWidth="0.9" opacity="0.7" />
        {/* 冠顶太极饰 */}
        <g transform="translate(110, 24)">
          <circle r="9" fill="#1a1e26" stroke="#c9a86c" strokeWidth="1.4" />
          <path d="M0 -9 A9 9 0 0 1 0 9 A4.5 4.5 0 0 1 0 0 A4.5 4.5 0 0 0 0 -9" fill="#f5f0e6" />
          <circle cy="-4.5" r="1.6" fill="#1a1e26" />
          <circle cy="4.5" r="1.6" fill="#f5f0e6" />
        </g>
        <rect x="100" y="62" width="20" height="8" rx="2" fill="#c9a86c" />
        <circle cx="110" cy="66" r="2.5" fill="#2a2430" />
        <line x1="84" y1="50" x2="70" y2="40" stroke="#c9a86c" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="136" y1="50" x2="150" y2="40" stroke="#c9a86c" strokeWidth="1.4" strokeLinecap="round" />

        {/* 眉 — 略疏、带霜色 */}
        <path d="M88 92 Q97 86 106 92" fill="none" stroke="#6a6058" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M114 92 Q123 86 132 92" fill="none" stroke="#6a6058" strokeWidth="1.8" strokeLinecap="round" />

        {/* 眼 — 微眯有神 */}
        <ellipse className="xy-eye" cx="97" cy="100" rx="3.5" ry="3.6" fill="#1e1a28" />
        <ellipse className="xy-eye" cx="123" cy="100" rx="3.5" ry="3.6" fill="#1e1a28" />
        <circle cx="98.2" cy="98.8" r="1.1" fill="#fff" opacity="0.75" />
        <circle cx="124.2" cy="98.8" r="1.1" fill="#fff" opacity="0.75" />

        {/* 鼻 */}
        <path
          d="M110 104 L107 116 Q110 118 113 116 Z"
          fill="none"
          stroke="#c4a088"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />

        {/* 嘴 */}
        <ellipse
          className={`xy-mouth ${mouthOpen ? 'xy-mouth--open' : ''}`}
          cx="110"
          cy="126"
          rx={mouthOpen ? 7.2 : 6.2}
          ry={mouthOpen ? 4.6 : 1.8}
          fill={mouthOpen ? '#6b3a45' : '#b08978'}
        />

        {/* 长白须 — 仙风三主缕 + 侧须 */}
        <path
          d="M100 132 Q92 170 88 210"
          fill="none"
          stroke="url(#xyBeard)"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M110 134 Q110 178 110 228"
          fill="none"
          stroke="url(#xyBeard)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M120 132 Q128 170 132 210"
          fill="none"
          stroke="url(#xyBeard)"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M104 136 Q100 188 96 236"
          fill="none"
          stroke="#e8e2d6"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M116 136 Q120 188 124 236"
          fill="none"
          stroke="#e8e2d6"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.75"
        />
        {/* 颊须 */}
        <path
          d="M82 120 Q88 142 96 152"
          fill="none"
          stroke="#e4ddd0"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M138 120 Q132 142 124 152"
          fill="none"
          stroke="#e4ddd0"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* 须梢飘逸 */}
        <path
          d="M88 210 Q84 248 78 268"
          fill="none"
          stroke="#cfc8ba"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M110 228 Q112 262 110 286"
          fill="none"
          stroke="#d8d2c4"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M132 210 Q136 248 142 268"
          fill="none"
          stroke="#cfc8ba"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.65"
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
