import type { CharacterMood } from './dialogueScript';

type Props = {
  mood: CharacterMood;
  className?: string;
};

/**
 * 玄隐先生 — 仙风道家 SVG
 * 太极冠饰、银白长须、岁月面纹、交领道袍
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
        viewBox="0 0 220 340"
        width="204"
        height="314"
        role="img"
        aria-label="玄隐先生"
      >
        <defs>
          <radialGradient id="xyFaceGlow" cx="48%" cy="36%" r="58%">
            <stop offset="0%" stopColor="#fff8f0" />
            <stop offset="55%" stopColor="#e8c9ae" />
            <stop offset="100%" stopColor="#d2a888" />
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
            <stop offset="0%" stopColor="#f7f5f0" />
            <stop offset="55%" stopColor="#ddd6c8" />
            <stop offset="100%" stopColor="#a8a090" />
          </linearGradient>
          <linearGradient id="xyCrown" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2f3540" />
            <stop offset="100%" stopColor="#1a1e26" />
          </linearGradient>
          <linearGradient id="xyBeardFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#faf8f4" />
            <stop offset="60%" stopColor="#e8e2d6" />
            <stop offset="100%" stopColor="#c2b8a6" />
          </linearGradient>
        </defs>

        {/* 道袍 */}
        <path
          d="M26 158 C42 128 68 120 110 120 C152 120 178 128 194 158 L210 330 L10 330 Z"
          fill="url(#xyRobe)"
        />
        <path d="M26 158 C16 190 12 236 20 280 L48 272 C40 230 38 188 48 162 Z" fill="#1c2430" />
        <path d="M194 158 C204 190 208 236 200 280 L172 272 C180 230 182 188 172 162 Z" fill="#1c2430" />
        <path d="M110 136 L110 330" stroke="url(#xyAccent)" strokeWidth="1.4" opacity="0.65" />
        <path d="M76 136 L110 172 L144 136" fill="none" stroke="#c9a86c" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M86 140 L110 166 L134 140" fill="url(#xyRobeInner)" opacity="0.9" />

        {/* 腰绦玉佩 */}
        <path d="M58 220 H162" stroke="#c9a86c" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <path d="M110 220 L110 258" stroke="#c9a86c" strokeWidth="1.3" opacity="0.75" />
        <ellipse cx="110" cy="268" rx="10" ry="13" fill="#dce8e0" stroke="#8a9a88" strokeWidth="1.2" />
        <circle cx="110" cy="268" r="2.4" fill="#9bb09a" />

        {/* 云肩 */}
        <path
          d="M46 148 C70 136 90 132 110 132 C130 132 150 136 174 148 L162 168 C142 154 128 150 110 150 C92 150 78 154 58 168 Z"
          fill="#2a3340"
          opacity="0.55"
        />

        {/* 银白发 */}
        <ellipse cx="110" cy="94" rx="48" ry="52" fill="url(#xyHair)" />
        <path d="M62 98 Q50 136 54 172" fill="none" stroke="#ebe6dc" strokeWidth="14" strokeLinecap="round" opacity="0.7" />
        <path d="M158 98 Q170 136 166 172" fill="none" stroke="#ebe6dc" strokeWidth="14" strokeLinecap="round" opacity="0.7" />

        {/* 面庞 */}
        <ellipse cx="110" cy="106" rx="38" ry="42" fill="url(#xyFaceGlow)" />
        <ellipse cx="72" cy="110" rx="7.5" ry="12" fill="#dcb89a" />
        <ellipse cx="148" cy="110" rx="7.5" ry="12" fill="#dcb89a" />

        {/* 岁月痕迹（加粗可见） */}
        <path d="M90 82 Q110 76 130 82" fill="none" stroke="#b88870" strokeWidth="1.5" opacity="0.7" />
        <path d="M94 89 Q110 85 126 89" fill="none" stroke="#b88870" strokeWidth="1.2" opacity="0.55" />
        <path d="M82 108 Q76 116 82 122" fill="none" stroke="#b88870" strokeWidth="1.2" opacity="0.65" />
        <path d="M138 108 Q144 116 138 122" fill="none" stroke="#b88870" strokeWidth="1.2" opacity="0.65" />
        <path d="M96 124 Q103 132 108 136" fill="none" stroke="#b88870" strokeWidth="1.2" opacity="0.6" />
        <path d="M124 124 Q117 132 112 136" fill="none" stroke="#b88870" strokeWidth="1.2" opacity="0.6" />
        <circle cx="86" cy="118" r="2" fill="#c08a6e" opacity="0.4" />
        <circle cx="132" cy="116" r="1.7" fill="#c08a6e" opacity="0.35" />
        <circle cx="120" cy="90" r="1.4" fill="#c08a6e" opacity="0.32" />

        {/* 道冠 */}
        <path
          d="M74 70 C78 34 96 18 110 16 C124 18 142 34 146 70 L136 76 C132 50 122 40 110 38 C98 40 88 50 84 76 Z"
          fill="url(#xyCrown)"
        />
        <path d="M90 56 L110 26 L130 56" fill="none" stroke="#c9a86c" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M98 60 L110 36 L122 60" fill="none" stroke="#e8d5a3" strokeWidth="1" opacity="0.75" />
        {/* 太极冠饰（放大） */}
        <g transform="translate(110, 22)">
          <circle r="12" fill="#1a1e26" stroke="#c9a86c" strokeWidth="1.8" />
          <path d="M0 -12 A12 12 0 0 1 0 12 A6 6 0 0 1 0 0 A6 6 0 0 0 0 -12 Z" fill="#f5f0e6" />
          <circle cy="-6" r="2.2" fill="#1a1e26" />
          <circle cy="6" r="2.2" fill="#f5f0e6" />
        </g>
        <rect x="98" y="66" width="24" height="9" rx="2" fill="#c9a86c" />
        <circle cx="110" cy="70.5" r="2.8" fill="#1a1e26" />
        <line x1="82" y1="52" x2="66" y2="40" stroke="#c9a86c" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="138" y1="52" x2="154" y2="40" stroke="#c9a86c" strokeWidth="1.6" strokeLinecap="round" />

        {/* 眉眼鼻嘴 */}
        <path d="M86 96 Q97 89 107 96" fill="none" stroke="#5a5248" strokeWidth="2" strokeLinecap="round" />
        <path d="M113 96 Q123 89 134 96" fill="none" stroke="#5a5248" strokeWidth="2" strokeLinecap="round" />
        <ellipse className="xy-eye" cx="96" cy="106" rx="3.6" ry="3.8" fill="#1e1a28" />
        <ellipse className="xy-eye" cx="124" cy="106" rx="3.6" ry="3.8" fill="#1e1a28" />
        <circle cx="97.3" cy="104.7" r="1.15" fill="#fff" opacity="0.8" />
        <circle cx="125.3" cy="104.7" r="1.15" fill="#fff" opacity="0.8" />
        <path d="M110 110 L106 122 Q110 125 114 122 Z" fill="none" stroke="#c4a088" strokeWidth="1.4" strokeLinejoin="round" />
        <ellipse
          className={`xy-mouth ${mouthOpen ? 'xy-mouth--open' : ''}`}
          cx="110"
          cy="132"
          rx={mouthOpen ? 7 : 6}
          ry={mouthOpen ? 4.5 : 1.7}
          fill={mouthOpen ? '#6b3a45' : '#b08978'}
        />

        {/* 仙风长白须 — 实心造型，盖过胸前 */}
        <path
          d="M86 136
             C78 150 72 170 70 196
             C68 230 74 270 82 300
             C90 318 102 322 110 322
             C118 322 130 318 138 300
             C146 270 152 230 150 196
             C148 170 142 150 134 136
             C128 142 118 146 110 146
             C102 146 92 142 86 136 Z"
          fill="url(#xyBeardFill)"
          opacity="0.96"
        />
        {/* 须缕分隔线，增强飘逸感 */}
        <path d="M98 148 Q94 210 92 290" fill="none" stroke="#b8ae9c" strokeWidth="1.1" opacity="0.45" />
        <path d="M110 148 Q110 220 110 310" fill="none" stroke="#b8ae9c" strokeWidth="1.2" opacity="0.5" />
        <path d="M122 148 Q126 210 128 290" fill="none" stroke="#b8ae9c" strokeWidth="1.1" opacity="0.45" />
        {/* 颊须 */}
        <path
          d="M78 122 C74 138 78 152 90 158 C86 146 84 132 86 124 Z"
          fill="#f2ede4"
          opacity="0.9"
        />
        <path
          d="M142 122 C146 138 142 152 130 158 C134 146 136 132 134 124 Z"
          fill="#f2ede4"
          opacity="0.9"
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
