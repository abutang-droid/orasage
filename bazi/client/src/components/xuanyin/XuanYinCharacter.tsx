import type { CharacterMood } from './dialogueScript';

type Props = {
  mood: CharacterMood;
  className?: string;
};

/**
 * 玄隐先生 — 国风 SVG 角色（道冠、长袍）+ 神态
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
        viewBox="0 0 200 260"
        width="180"
        height="234"
        role="img"
        aria-label="玄隐先生"
      >
        <defs>
          <radialGradient id="xyFaceGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#fff8f0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e8d5c4" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="xyRobe" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5b4a7a" />
            <stop offset="100%" stopColor="#2a2438" />
          </linearGradient>
          <linearGradient id="xyAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c9a86c" />
            <stop offset="100%" stopColor="#e8d5a3" />
          </linearGradient>
        </defs>

        {/* 长袍 */}
        <path
          d="M40 120 C50 100 70 95 100 95 C130 95 150 100 160 120 L175 250 L25 250 Z"
          fill="url(#xyRobe)"
        />
        <path
          d="M100 95 L100 250"
          stroke="url(#xyAccent)"
          strokeWidth="1.2"
          opacity="0.55"
        />
        {/* 衣领 */}
        <path d="M78 108 L100 128 L122 108" fill="none" stroke="#c9a86c" strokeWidth="1.5" />

        {/* 肩 */}
        <ellipse cx="55" cy="125" rx="18" ry="10" fill="#3d3355" opacity="0.5" />
        <ellipse cx="145" cy="125" rx="18" ry="10" fill="#3d3355" opacity="0.5" />

        {/* 头 */}
        <ellipse cx="100" cy="72" rx="38" ry="42" fill="url(#xyFaceGlow)" />

        {/* 道冠 */}
        <path
          d="M70 48 C75 28 90 22 100 22 C110 22 125 28 130 48 L120 52 C115 38 105 34 100 34 C95 34 85 38 80 52 Z"
          fill="#2a2438"
        />
        <rect x="92" y="18" width="16" height="10" rx="2" fill="#c9a86c" />
        <circle cx="100" cy="23" r="3" fill="#e8d5a3" />

        {/* 眉眼 */}
        <path d="M82 68 Q88 64 94 68" fill="none" stroke="#3a3048" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M106 68 Q112 64 118 68" fill="none" stroke="#3a3048" strokeWidth="1.6" strokeLinecap="round" />
        <ellipse className="xy-eye" cx="88" cy="74" rx="3.2" ry="3.8" fill="#2a2438" />
        <ellipse className="xy-eye" cx="112" cy="74" rx="3.2" ry="3.8" fill="#2a2438" />
        <circle cx="89" cy="73" r="1" fill="#fff" opacity="0.7" />
        <circle cx="113" cy="73" r="1" fill="#fff" opacity="0.7" />

        {/* 鼻 */}
        <path d="M100 78 L98 88 L102 88" fill="none" stroke="#c4a890" strokeWidth="1.2" strokeLinejoin="round" />

        {/* 嘴 — speaking 时开合 */}
        <ellipse
          className={`xy-mouth ${mouthOpen ? 'xy-mouth--open' : ''}`}
          cx="100"
          cy="98"
          rx={mouthOpen ? 7 : 6}
          ry={mouthOpen ? 4.5 : 1.8}
          fill={mouthOpen ? '#6b3a45' : '#b08978'}
        />

        {/* 胡须淡影 */}
        <path d="M90 102 Q100 110 110 102" fill="none" stroke="#8a7060" strokeWidth="0.8" opacity="0.45" />
      </svg>

      {mood === 'listening' ? (
        <p className="xy-mood-label">聆听中</p>
      ) : mood === 'thinking' ? (
        <p className="xy-mood-label">思考中</p>
      ) : null}
    </div>
  );
}
