"use client"

// ─── Rich SVG Illustrations for all 78 Tarot Cards ───────────
// Each card has a detailed scene with figures, landscape, and symbols
// ViewBox: 0 0 80 120 (portrait card proportions)

const CARD_ART: Record<string, React.ReactNode> = {

  // ══════════════════════════════════════════════════════════════
  // MAJOR ARCANA
  // ══════════════════════════════════════════════════════════════

  // 0 - The Fool: Young figure stepping off a cliff, dog at heels, sun above
  fool: <>
    {/* Sky */}
    <rect x="0" y="0" width="80" height="70" fill="url(#foolSky)" rx="0"/>
    <defs>
      <linearGradient id="foolSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a1a4e" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#2d1b69" stopOpacity="0.7"/>
      </linearGradient>
    </defs>
    {/* Mountains */}
    <path d="M0 70 L15 45 L28 60 L40 35 L55 55 L70 40 L80 50 L80 70Z" fill="rgba(255,255,255,0.06)"/>
    {/* Cliff */}
    <path d="M0 90 L35 70 L45 72 L80 85 L80 120 L0 120Z" fill="rgba(201,149,74,0.15)"/>
    <path d="M30 70 L48 70 L50 120 L28 120Z" fill="rgba(201,149,74,0.2)"/>
    {/* Sun */}
    <circle cx="62" cy="18" r="9" fill="rgba(255,200,80,0.25)" stroke="rgba(255,200,80,0.6)" strokeWidth="0.8"/>
    <circle cx="62" cy="18" r="5" fill="rgba(255,200,80,0.4)"/>
    {[0,45,90,135,180,225,270,315].map((a,i)=>(
      <line key={i} x1={62+7*Math.cos(a*Math.PI/180)} y1={18+7*Math.sin(a*Math.PI/180)}
        x2={62+11*Math.cos(a*Math.PI/180)} y2={18+11*Math.sin(a*Math.PI/180)}
        stroke="rgba(255,200,80,0.5)" strokeWidth="0.8" strokeLinecap="round"/>
    ))}
    {/* Figure body */}
    <circle cx="35" cy="52" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {/* Face details */}
    <circle cx="33.5" cy="51" r="0.6" fill="currentColor" opacity="0.7"/>
    <circle cx="36.5" cy="51" r="0.6" fill="currentColor" opacity="0.7"/>
    <path d="M33.5 53.5 Q35 55 36.5 53.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Hat */}
    <path d="M30.5 49 Q35 44 39.5 49" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M31 49 L39 49" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Body / tunic */}
    <path d="M35 56.5 L33 68 M35 56.5 L37 68" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M33 60 L37 60" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Arms */}
    <path d="M35 58 L28 62 M35 58 L44 55" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Staff with bundle */}
    <path d="M44 55 L50 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="50" cy="41" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M48 43 L52 39" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M33 68 L31 78 M37 68 L39 76" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Dog */}
    <path d="M40 72 L44 68 L48 70 L50 68 L52 70 L50 75 L44 76Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="50" cy="67" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Flower */}
    {[0,72,144,216,288].map((a,i)=>(
      <ellipse key={i} cx={27+3*Math.cos(a*Math.PI/180)} cy={65+3*Math.sin(a*Math.PI/180)} rx="1.5" ry="1" fill="none" stroke="currentColor" strokeWidth="0.7" transform={`rotate(${a},${27+3*Math.cos(a*Math.PI/180)},${65+3*Math.sin(a*Math.PI/180)})`}/>
    ))}
    <circle cx="27" cy="65" r="1.2" fill="currentColor" opacity="0.4"/>
    {/* Stars */}
    {[[10,12],[20,8],[50,10],[70,25]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.8" fill="currentColor" opacity="0.5"/>
    ))}
  </>,

  // I - The Magician: Robed figure at altar, infinity symbol above, four elements
  magician: <>
    <defs>
      <linearGradient id="magBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0d1b3e" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#1a0a2e" stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#magBg)"/>
    {/* Infinity symbol */}
    <path d="M28 15 Q32 10 38 15 Q44 20 50 15 Q56 10 52 15 Q48 20 42 15 Q36 10 28 15Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
    {/* Figure */}
    <circle cx="40" cy="38" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 40 Q40 41.5 41.5 40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Robe */}
    <path d="M40 43.5 L36 65 L44 65 Z" fill="rgba(201,149,74,0.15)" stroke="currentColor" strokeWidth="1"/>
    <path d="M37 50 L43 50" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Belt */}
    <path d="M36 55 L44 55" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Arms raised */}
    <path d="M36 48 L26 40" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M44 48 L54 35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Wand raised */}
    <path d="M54 35 L56 25" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="56" cy="23" r="2" fill="currentColor" opacity="0.6"/>
    <path d="M54 22 L58 22 M56 20 L56 24" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Altar with 4 elements */}
    <rect x="22" y="68" width="36" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Cup */}
    <path d="M26 68 L24 62 L30 62 L28 68" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Wand */}
    <path d="M36 68 L36 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="36" cy="59" r="1.2" fill="currentColor" opacity="0.5"/>
    {/* Sword */}
    <path d="M44 68 L44 60 M42 63 L46 63" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Pentacle */}
    <circle cx="52" cy="64" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M52 61 L53 63.5 L55.5 63.5 L53.5 65 L54.3 67.5 L52 66 L49.7 67.5 L50.5 65 L48.5 63.5 L51 63.5Z" fill="none" stroke="currentColor" strokeWidth="0.6"/>
    {/* Roses */}
    {[[15,80],[65,80],[15,100],[65,100]].map(([x,y],i)=>(
      <g key={i}>
        <circle cx={x} cy={y} r="3" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
        <circle cx={x} cy={y} r="1.2" fill="currentColor" opacity="0.3"/>
      </g>
    ))}
    {/* Stars */}
    {[[10,10],[70,10],[15,30],[65,30]].map(([x,y],i)=>(
      <path key={i} d={`M${x} ${y-2} L${x+0.7} ${y+0.5} L${x+2} ${y+0.5} L${x+1} ${y+1.8} L${x+1.5} ${y+3.5} L${x} ${y+2.5} L${x-1.5} ${y+3.5} L${x-1} ${y+1.8} L${x-2} ${y+0.5} L${x-0.7} ${y+0.5}Z`} fill="currentColor" opacity="0.3"/>
    ))}
  </>,

  // II - The High Priestess: Seated between pillars, crescent moon, veil
  highpriestess: <>
    <defs>
      <linearGradient id="hpBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a0a2e" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#1a0d3d" stopOpacity="0.9"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#hpBg)"/>
    {/* Two pillars */}
    <rect x="8" y="20" width="10" height="80" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
    <rect x="62" y="20" width="10" height="80" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
    {/* Pillar capitals */}
    <rect x="6" y="18" width="14" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
    <rect x="60" y="18" width="14" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* B and J on pillars */}
    <text x="13" y="35" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="serif">B</text>
    <text x="67" y="35" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.6" fontFamily="serif">J</text>
    {/* Veil / curtain */}
    <path d="M18 25 Q40 30 62 25 L62 100 Q40 95 18 100Z" fill="rgba(100,50,150,0.12)" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 3"/>
    {/* Moon crescent */}
    <path d="M40 8 A10 10 0 1 1 40 28 A6 6 0 1 0 40 8Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {/* Figure seated */}
    <circle cx="40" cy="45" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Crown */}
    <path d="M35 41 L37 36 L40 40 L43 36 L45 41" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    <circle cx="40" cy="35.5" r="1.5" fill="currentColor" opacity="0.5"/>
    {/* Robe */}
    <path d="M40 50 L34 75 L46 75Z" fill="rgba(100,80,200,0.15)" stroke="currentColor" strokeWidth="1"/>
    <path d="M35 58 L45 58" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 52 L28 58 M44 52 L52 58" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Scroll */}
    <rect x="26" y="55" width="12" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M28 58 L36 58 M28 60 L34 60" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"/>
    <text x="32" y="57.5" textAnchor="middle" fontSize="4" fill="currentColor" opacity="0.5">TORA</text>
    {/* Cross on chest */}
    <path d="M39 53 L41 53 M40 52 L40 54" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Stars */}
    {[[20,10],[60,10],[15,15],[65,15],[25,8],[55,8]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.7" fill="currentColor" opacity="0.5"/>
    ))}
    {/* Water at bottom */}
    <path d="M18 90 Q30 86 40 90 Q50 94 62 90 L62 105 Q50 101 40 105 Q30 109 18 105Z" fill="rgba(80,120,200,0.15)" stroke="currentColor" strokeWidth="0.7"/>
  </>,

  // III - The Empress: Crowned woman in garden, wheat, Venus symbol
  empress: <>
    <defs>
      <linearGradient id="empBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0d1a0d" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#1a1a0a" stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#empBg)"/>
    {/* Forest background */}
    {[8,18,55,65,72].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 80 L${x-6} 50 L${x+6} 50Z`} fill="rgba(40,80,40,0.3)" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
        <path d={`M${x} 65 L${x-5} 40 L${x+5} 40Z`} fill="rgba(40,80,40,0.3)" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
      </g>
    ))}
    {/* Waterfall */}
    <path d="M60 60 Q65 70 62 85 Q60 95 58 105" fill="none" stroke="rgba(100,150,200,0.4)" strokeWidth="2" strokeLinecap="round"/>
    {/* Throne */}
    <rect x="24" y="55" width="32" height="45" rx="3" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M24 55 L24 45 L30 50 L40 43 L50 50 L56 45 L56 55" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    {/* Cushion */}
    <ellipse cx="40" cy="75" rx="14" ry="4" fill="rgba(201,149,74,0.15)" stroke="currentColor" strokeWidth="0.7"/>
    {/* Figure */}
    <circle cx="40" cy="42" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Star crown */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
      <circle key={i} cx={40+7*Math.cos(a*Math.PI/180)} cy={40+7*Math.sin(a*Math.PI/180)} r="0.8" fill="currentColor" opacity="0.5"/>
    ))}
    {/* Robe */}
    <path d="M40 47.5 L32 72 L48 72Z" fill="rgba(150,100,200,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M33 58 L47 58" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 52 L26 60 M44 52 L54 58" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Scepter */}
    <path d="M54 58 L58 45" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="58" cy="43" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M56 43 L60 43 M58 41 L58 45" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Venus symbol */}
    <circle cx="20" cy="25" r="5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M20 30 L20 36 M17 33 L23 33" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Wheat */}
    {[28,32,36,40,44,48,52].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 85 L${x} 95`} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <ellipse cx={x} cy="83" rx="1.5" ry="3" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.6"/>
      </g>
    ))}
    {/* Pomegranates */}
    <circle cx="15" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <circle cx="65" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
  </>,

  // IV - The Emperor: Armored king on throne, mountains, ram heads
  emperor: <>
    <defs>
      <linearGradient id="empeBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a0a0a" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#2a1a0a" stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#empeBg)"/>
    {/* Mountains */}
    <path d="M0 80 L20 50 L35 65 L50 40 L65 60 L80 45 L80 80Z" fill="rgba(180,100,50,0.15)" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Throne */}
    <rect x="20" y="45" width="40" height="55" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M20 45 L20 35 L28 42 L40 33 L52 42 L60 35 L60 45" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Ram heads on throne */}
    <path d="M22 50 Q18 46 20 42 Q24 44 22 50Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M58 50 Q62 46 60 42 Q56 44 58 50Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Figure */}
    <circle cx="40" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 50 Q40 51 41.5 50" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M35 44 L36 38 L40 42 L44 38 L45 44" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M35 44 L45 44" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Beard */}
    <path d="M37 52 Q40 56 43 52" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Armor body */}
    <path d="M40 53 L34 72 L46 72Z" fill="rgba(150,100,50,0.2)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M35 58 L45 58 M35 63 L45 63" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Armor plates */}
    <path d="M36 53 L38 53 L38 57 L36 57Z M42 53 L44 53 L44 57 L42 57Z" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* Arms */}
    <path d="M36 55 L26 62 M44 55 L54 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Orb */}
    <circle cx="26" cy="63" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M26 59 L26 67 M22 63 L30 63" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Scepter */}
    <path d="M54 60 L58 45" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M55 47 L61 47 M58 44 L58 50" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M36 72 L34 85 M44 72 L46 85" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Boots */}
    <path d="M32 85 L36 85 L36 90 L30 90Z M44 85 L48 85 L48 90 L42 90Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
  </>,

  // V - The Hierophant: Papal figure with two acolytes, crossed keys
  hierophant: <>
    <defs>
      <linearGradient id="hierBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#1a0a2e" stopOpacity="0.9"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#hierBg)"/>
    {/* Arch */}
    <path d="M10 120 L10 35 Q40 10 70 35 L70 120" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
    {/* Two pillars */}
    <rect x="10" y="35" width="8" height="85" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    <rect x="62" y="35" width="8" height="85" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    {/* Main figure */}
    <circle cx="40" cy="38" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    {/* Triple crown */}
    <path d="M34 34 L36 26 L40 32 L44 26 L46 34" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M35 30 L45 30" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M34 34 L46 34" stroke="currentColor" strokeWidth="1"/>
    <circle cx="40" cy="25" r="1.5" fill="currentColor" opacity="0.5"/>
    {/* Robe */}
    <path d="M40 43.5 L32 75 L48 75Z" fill="rgba(150,100,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M33 52 L47 52 M33 60 L47 60" stroke="currentColor" strokeWidth="0.8"/>
    {/* Cross on robe */}
    <path d="M39 54 L41 54 M40 53 L40 55" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Raised hand blessing */}
    <path d="M44 50 L52 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M50 40 L54 40 L54 44 L52 46" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Staff */}
    <path d="M36 50 L28 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M28 42 L28 30" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M25 30 L31 30 M28 27 L28 33" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Two acolytes */}
    <circle cx="22" cy="72" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M22 75.5 L20 85 L24 85Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="58" cy="72" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M58 75.5 L56 85 L60 85Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Crossed keys */}
    <path d="M32 90 L48 100 M48 90 L32 100" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="32" cy="90" r="3" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="48" cy="90" r="3" fill="none" stroke="currentColor" strokeWidth="0.9"/>
  </>,

  // VI - The Lovers: Two figures, angel above, sun, mountain
  lovers: <>
    <defs>
      <linearGradient id="lovBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a0a0a" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#0a1a0a" stopOpacity="0.9"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#lovBg)"/>
    {/* Sun */}
    <circle cx="40" cy="15" r="8" fill="rgba(255,200,80,0.2)" stroke="rgba(255,200,80,0.5)" strokeWidth="1"/>
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
      <line key={i} x1={40+10*Math.cos(a*Math.PI/180)} y1={15+10*Math.sin(a*Math.PI/180)}
        x2={40+14*Math.cos(a*Math.PI/180)} y2={15+14*Math.sin(a*Math.PI/180)}
        stroke="rgba(255,200,80,0.4)" strokeWidth="0.8" strokeLinecap="round"/>
    ))}
    {/* Angel */}
    <circle cx="40" cy="30" r="4" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M38 34 L36 42 L44 42 L42 34Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Angel wings */}
    <path d="M36 36 Q28 32 25 38 Q30 40 36 38" fill="rgba(255,255,255,0.08)" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M44 36 Q52 32 55 38 Q50 40 44 38" fill="rgba(255,255,255,0.08)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Halo */}
    <circle cx="40" cy="29" r="6" fill="none" stroke="rgba(255,200,80,0.4)" strokeWidth="0.8" strokeDasharray="2 2"/>
    {/* Mountain */}
    <path d="M30 80 L40 55 L50 80Z" fill="rgba(150,100,50,0.2)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Female figure (left) */}
    <circle cx="22" cy="62" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="21" cy="60.5" r="0.6" fill="currentColor" opacity="0.7"/>
    <circle cx="23" cy="60.5" r="0.6" fill="currentColor" opacity="0.7"/>
    <path d="M22 66 L19 80 L25 80Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M20 70 L24 70" stroke="currentColor" strokeWidth="0.8"/>
    {/* Hair */}
    <path d="M18 60 Q22 56 26 60" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Male figure (right) */}
    <circle cx="58" cy="62" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="57" cy="60.5" r="0.6" fill="currentColor" opacity="0.7"/>
    <circle cx="59" cy="60.5" r="0.6" fill="currentColor" opacity="0.7"/>
    <path d="M58 66 L55 80 L61 80Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M56 70 L60 70" stroke="currentColor" strokeWidth="0.8"/>
    {/* Tree of knowledge (left) */}
    <path d="M12 120 L12 90" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="12" cy="85" r="6" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <circle cx="10" cy="80" r="3" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    <circle cx="14" cy="80" r="3" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Snake */}
    <path d="M12 90 Q8 85 10 80 Q14 75 12 70" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
    {/* Tree of life (right) */}
    <path d="M68 120 L68 90" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="68" cy="85" r="6" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    {[0,45,90,135,180,225,270,315].map((a,i)=>(
      <path key={i} d={`M68 85 L${68+8*Math.cos(a*Math.PI/180)} ${85+8*Math.sin(a*Math.PI/180)}`} stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.4"/>
    ))}
  </>,

  // VII - The Chariot: Armored warrior in chariot, two sphinxes
  chariot: <>
    <defs>
      <linearGradient id="charBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#1a1a0a" stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#charBg)"/>
    {/* Stars */}
    {[[10,10],[20,8],[60,12],[70,8],[15,20],[65,18]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.8" fill="currentColor" opacity="0.5"/>
    ))}
    {/* Canopy with stars */}
    <path d="M15 35 L15 25 Q40 18 65 25 L65 35" fill="rgba(50,50,100,0.2)" stroke="currentColor" strokeWidth="1"/>
    <path d="M15 25 Q40 18 65 25" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Chariot body */}
    <rect x="18" y="55" width="44" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M18 65 L62 65" stroke="currentColor" strokeWidth="0.8"/>
    {/* Winged sun on chariot */}
    <circle cx="40" cy="70" r="4" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M36 70 Q30 67 25 70 M44 70 Q50 67 55 70" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Wheels */}
    <circle cx="25" cy="88" r="8" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="25" cy="88" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {[0,45,90,135].map((a,i)=>(
      <line key={i} x1={25+3*Math.cos(a*Math.PI/180)} y1={88+3*Math.sin(a*Math.PI/180)}
        x2={25+8*Math.cos(a*Math.PI/180)} y2={88+8*Math.sin(a*Math.PI/180)}
        stroke="currentColor" strokeWidth="0.9"/>
    ))}
    <circle cx="55" cy="88" r="8" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="55" cy="88" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {[0,45,90,135].map((a,i)=>(
      <line key={i} x1={55+3*Math.cos(a*Math.PI/180)} y1={88+3*Math.sin(a*Math.PI/180)}
        x2={55+8*Math.cos(a*Math.PI/180)} y2={88+8*Math.sin(a*Math.PI/180)}
        stroke="currentColor" strokeWidth="0.9"/>
    ))}
    {/* Warrior figure */}
    <circle cx="40" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    {/* Helmet */}
    <path d="M35 39 Q40 33 45 39" fill="rgba(200,150,50,0.2)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M38 33 L42 33" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Armor */}
    <path d="M40 47 L36 58 L44 58Z" fill="rgba(150,150,200,0.15)" stroke="currentColor" strokeWidth="1"/>
    <path d="M37 51 L43 51" stroke="currentColor" strokeWidth="0.8"/>
    {/* Scepter */}
    <path d="M44 50 L50 38" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M48 36 L52 36 M50 34 L50 38" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Two sphinxes */}
    {/* Black sphinx */}
    <path d="M12 80 L12 72 L20 72 L22 75 L22 80Z" fill="rgba(0,0,0,0.4)" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="12" cy="70" r="3" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M10 72 Q8 68 12 67 Q16 68 14 72" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* White sphinx */}
    <path d="M58 80 L58 72 L66 72 L68 75 L68 80Z" fill="rgba(255,255,255,0.08)" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="68" cy="70" r="3" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M66 72 Q64 68 68 67 Q72 68 70 72" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* Reins */}
    <path d="M36 55 Q24 65 20 75" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2"/>
    <path d="M44 55 Q56 65 60 75" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2"/>
  </>,

  // VIII - Strength: Woman with lion, infinity symbol
  strength: <>
    <defs>
      <linearGradient id="strBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0d1a0d" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#1a1a0a" stopOpacity="0.8"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#strBg)"/>
    {/* Mountains */}
    <path d="M0 80 L25 55 L40 65 L55 48 L80 65 L80 80Z" fill="rgba(100,150,80,0.12)" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
    {/* Infinity symbol */}
    <path d="M28 18 Q32 13 38 18 Q44 23 50 18 Q56 13 52 18 Q48 23 42 18 Q36 13 28 18Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
    {/* Lion body */}
    <path d="M10 80 L15 70 L25 68 L45 70 L55 68 L62 72 L60 85 L45 88 L25 88 L12 85Z" fill="rgba(200,150,50,0.12)" stroke="currentColor" strokeWidth="1"/>
    {/* Lion head */}
    <circle cx="55" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    {/* Mane */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
      <path key={i} d={`M${55+8*Math.cos(a*Math.PI/180)} ${65+8*Math.sin(a*Math.PI/180)} L${55+12*Math.cos(a*Math.PI/180)} ${65+12*Math.sin(a*Math.PI/180)}`} stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    ))}
    {/* Lion face */}
    <circle cx="52.5" cy="63" r="1" fill="currentColor" opacity="0.7"/>
    <circle cx="57.5" cy="63" r="1" fill="currentColor" opacity="0.7"/>
    <path d="M52 67 Q55 70 58 67" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <path d="M55 65 L55 68" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Lion paws */}
    <path d="M15 85 L12 95 L18 95" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M45 88 L43 95 L47 95" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Lion tail */}
    <path d="M10 80 Q5 75 8 68 Q12 62 10 58" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M10 58 Q8 54 12 52" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Woman figure */}
    <circle cx="35" cy="45" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="33.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="36.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M33.5 47 Q35 48.5 36.5 47" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Flower crown */}
    {[0,60,120,180,240,300].map((a,i)=>(
      <circle key={i} cx={35+6*Math.cos(a*Math.PI/180)} cy={43+6*Math.sin(a*Math.PI/180)} r="1.2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.6"/>
    ))}
    {/* White robe */}
    <path d="M35 50 L28 70 L42 70Z" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1"/>
    <path d="M29 60 L41 60" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms toward lion */}
    <path d="M38 52 L50 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M32 52 L22 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Flower garland */}
    <path d="M30 70 Q40 75 50 68" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2"/>
  </>,

  // IX - The Hermit: Old man with lantern on mountain peak
  hermit: <>
    <defs>
      <linearGradient id="herBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050510" stopOpacity="0.98"/>
        <stop offset="100%" stopColor="#0a0a20" stopOpacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#herBg)"/>
    {/* Stars */}
    {[[8,8],[15,5],[25,10],[45,6],[60,9],[70,5],[75,15],[5,20],[72,22]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.7" fill="currentColor" opacity="0.4"/>
    ))}
    {/* Mountain */}
    <path d="M0 100 L30 50 L40 60 L50 40 L60 55 L80 45 L80 100Z" fill="rgba(80,80,100,0.2)" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    <path d="M35 50 L40 42 L45 50" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Snow cap */}
    <path d="M37 48 L40 42 L43 48 Q40 50 37 48Z" fill="rgba(255,255,255,0.1)"/>
    {/* Figure */}
    <circle cx="40" cy="48" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="38.5" cy="46.5" r="0.6" fill="currentColor" opacity="0.7"/>
    <circle cx="41.5" cy="46.5" r="0.6" fill="currentColor" opacity="0.7"/>
    {/* Beard */}
    <path d="M37 51 Q40 55 43 51" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <path d="M38 52 L38 57 M40 53 L40 58 M42 52 L42 57" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.6"/>
    {/* Hood/cloak */}
    <path d="M35.5 44 Q40 40 44.5 44" fill="rgba(100,100,150,0.2)" stroke="currentColor" strokeWidth="1"/>
    {/* Cloak body */}
    <path d="M40 52.5 L33 75 L47 75Z" fill="rgba(80,80,120,0.15)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 62 L46 62" stroke="currentColor" strokeWidth="0.7"/>
    {/* Staff */}
    <path d="M34 55 L28 42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M28 42 L28 30" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    {/* Lantern */}
    <path d="M46 52 L52 48" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <rect x="49" y="44" width="8" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M51 44 L51 42 L55 42 L55 44" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Lantern glow */}
    <circle cx="53" cy="49" r="3" fill="rgba(255,200,80,0.15)"/>
    <circle cx="53" cy="49" r="1.5" fill="rgba(255,200,80,0.3)"/>
    {/* Star of David in lantern */}
    <path d="M51 48 L55 48 M52 46.5 L54 51 M54 46.5 L52 51" stroke="rgba(255,200,80,0.6)" strokeWidth="0.6" strokeLinecap="round"/>
    {/* Light rays from lantern */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
      <line key={i} x1={53+4*Math.cos(a*Math.PI/180)} y1={49+4*Math.sin(a*Math.PI/180)}
        x2={53+7*Math.cos(a*Math.PI/180)} y2={49+7*Math.sin(a*Math.PI/180)}
        stroke="rgba(255,200,80,0.2)" strokeWidth="0.6" strokeLinecap="round"/>
    ))}
    {/* Legs */}
    <path d="M36 75 L34 88 M44 75 L46 88" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  // X - Wheel of Fortune: Wheel with symbols, sphinx, serpent, jackal
  wheel: <>
    <defs>
      <linearGradient id="whlBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050510" stopOpacity="0.98"/>
        <stop offset="100%" stopColor="#0a0520" stopOpacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#whlBg)"/>
    {/* Clouds at corners */}
    <path d="M0 0 Q10 5 5 15 Q0 20 0 0Z" fill="rgba(255,255,255,0.05)"/>
    <path d="M80 0 Q70 5 75 15 Q80 20 80 0Z" fill="rgba(255,255,255,0.05)"/>
    {/* Four corner creatures */}
    {/* Angel (top-left) */}
    <circle cx="10" cy="15" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M8 19 L6 25 L14 25 L12 19Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Eagle (top-right) */}
    <path d="M70 10 Q75 8 78 12 Q75 16 70 14 Q65 12 70 10Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M74 12 L78 18" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Lion (bottom-left) */}
    <circle cx="10" cy="100" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M8 96 Q6 92 10 91 Q14 92 12 96" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Bull (bottom-right) */}
    <path d="M68 96 L72 96 L74 100 L72 104 L68 104 L66 100Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M68 96 Q66 92 70 91 M72 96 Q74 92 70 91" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Main wheel */}
    <circle cx="40" cy="55" r="28" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="40" cy="55" r="20" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="40" cy="55" r="10" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <circle cx="40" cy="55" r="3" fill="currentColor" opacity="0.4"/>
    {/* Spokes */}
    {[0,45,90,135].map((a,i)=>(
      <line key={i} x1={40+10*Math.cos(a*Math.PI/180)} y1={55+10*Math.sin(a*Math.PI/180)}
        x2={40+20*Math.cos(a*Math.PI/180)} y2={55+20*Math.sin(a*Math.PI/180)}
        stroke="currentColor" strokeWidth="1.2"/>
    ))}
    {/* Hebrew letters on wheel */}
    {['T','A','R','O'].map((l,i)=>(
      <text key={i} x={40+15*Math.cos(i*90*Math.PI/180)} y={55+15*Math.sin(i*90*Math.PI/180)+2}
        textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.6" fontFamily="serif">{l}</text>
    ))}
    {/* Symbols between letters */}
    {[45,135,225,315].map((a,i)=>(
      <text key={i} x={40+15*Math.cos(a*Math.PI/180)} y={55+15*Math.sin(a*Math.PI/180)+2}
        textAnchor="middle" fontSize="5" fill="currentColor" opacity="0.4" fontFamily="serif">{['△','□','☿','♃'][i]}</text>
    ))}
    {/* Sphinx on top */}
    <path d="M32 27 L48 27 L50 32 L30 32Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="40" cy="25" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M38 21 Q40 18 42 21" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Serpent going down */}
    <path d="M12 35 Q8 45 10 55 Q12 65 8 75" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M8 75 Q6 78 8 80" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Jackal going up */}
    <path d="M68 75 Q72 65 70 55 Q68 45 72 35" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="72" cy="33" r="3" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M70 30 Q72 27 74 30" fill="none" stroke="currentColor" strokeWidth="0.8"/>
  </>,

  // XI - Justice: Seated figure with scales and sword
  justice: <>
    <defs>
      <linearGradient id="justBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#1a0a0a" stopOpacity="0.9"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#justBg)"/>
    {/* Pillars */}
    <rect x="8" y="20" width="8" height="90" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    <rect x="64" y="20" width="8" height="90" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    <rect x="6" y="18" width="12" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <rect x="62" y="18" width="12" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Veil */}
    <path d="M16 25 L64 25 L64 30 L16 30Z" fill="rgba(150,100,50,0.15)" stroke="currentColor" strokeWidth="0.7"/>
    {/* Throne */}
    <rect x="22" y="55" width="36" height="45" rx="2" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
    {/* Figure */}
    <circle cx="40" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M35 38 L37 32 L40 36 L43 32 L45 38" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M35 38 L45 38" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 47 L34 72 L46 72Z" fill="rgba(150,100,50,0.15)" stroke="currentColor" strokeWidth="1"/>
    <path d="M35 57 L45 57" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 50 L26 55 M44 50 L54 45" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Scales */}
    <path d="M26 55 L26 48" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M22 48 L30 48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M22 48 L20 54 L24 54Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M30 48 L28 54 L32 54Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Sword raised */}
    <path d="M54 45 L58 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M52 32 L60 32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M56 28 L60 28" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M36 72 L34 85 M44 72 L46 85" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Shoes */}
    <path d="M30 85 L38 85 L38 88 L28 88Z M42 85 L50 85 L50 88 L40 88Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
  </>,

  // XII - The Hanged Man: Figure suspended upside down from tree
  hangedman: <>
    <defs>
      <linearGradient id="hangBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050510" stopOpacity="0.98"/>
        <stop offset="100%" stopColor="#0a0a20" stopOpacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#hangBg)"/>
    {/* T-shaped tree */}
    <path d="M40 15 L40 80" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M18 15 L62 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    {/* Tree roots/stumps */}
    <path d="M18 15 L15 25 M18 15 L20 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M62 15 L60 25 M62 15 L65 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* Leaves */}
    {[[18,15],[25,12],[35,10],[45,10],[55,12],[62,15]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="3" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    ))}
    {/* Rope */}
    <path d="M40 15 L40 28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Hanged figure (upside down) */}
    {/* Left leg bent (top since upside down) */}
    <path d="M40 28 L36 38 M36 38 L30 44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M40 28 L44 38" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Body */}
    <path d="M36 38 L44 38 L44 55 L36 55Z" fill="rgba(100,100,200,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M36 46 L44 46" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms spread */}
    <path d="M36 42 L26 48 M44 42 L54 48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Head (at bottom) */}
    <circle cx="40" cy="60" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="61.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="61.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 58 Q40 56.5 41.5 58" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Halo */}
    <circle cx="40" cy="60" r="7.5" fill="none" stroke="rgba(255,200,80,0.4)" strokeWidth="0.8" strokeDasharray="2 2"/>
    {/* Coins falling */}
    {[[25,65],[32,70],[50,68],[58,72]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="2" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    ))}
    {/* Stars */}
    {[[10,30],[70,30],[15,50],[65,50]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.7" fill="currentColor" opacity="0.4"/>
    ))}
  </>,

  // XIII - Death: Skeleton knight on horse, flag, fallen figures
  death: <>
    <defs>
      <linearGradient id="deathBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050505" stopOpacity="0.99"/>
        <stop offset="100%" stopColor="#0a0505" stopOpacity="0.98"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#deathBg)"/>
    {/* Dark sky */}
    <path d="M0 0 Q40 10 80 0 L80 50 Q40 40 0 50Z" fill="rgba(50,0,0,0.2)"/>
    {/* Sun setting */}
    <circle cx="60" cy="55" r="8" fill="rgba(200,100,50,0.15)" stroke="rgba(200,100,50,0.3)" strokeWidth="0.8"/>
    {/* Two towers */}
    <rect x="48" y="42" width="6" height="20" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <rect x="56" y="38" width="6" height="24" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    {/* River */}
    <path d="M0 85 Q20 80 40 85 Q60 90 80 85 L80 95 Q60 100 40 95 Q20 90 0 95Z" fill="rgba(50,80,150,0.15)"/>
    {/* Horse */}
    <path d="M15 65 L20 55 L35 52 L50 55 L55 65 L50 80 L35 82 L20 80Z" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1"/>
    {/* Horse head */}
    <path d="M50 55 L58 48 L62 52 L58 58 L50 58Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <circle cx="60" cy="50" r="1" fill="currentColor" opacity="0.6"/>
    {/* Horse legs */}
    <path d="M22 80 L20 95 M30 82 L28 95 M40 82 L38 95 M48 80 L46 95" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Skeleton rider */}
    {/* Skull */}
    <circle cx="38" cy="40" r="5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="36" cy="39" r="1" fill="currentColor" opacity="0.6"/>
    <circle cx="40" cy="39" r="1" fill="currentColor" opacity="0.6"/>
    <path d="M36 43 L40 43" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <path d="M36 43 L36 45 M38 43 L38 45 M40 43 L40 45" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"/>
    {/* Armor */}
    <path d="M38 45 L34 60 L42 60Z" fill="rgba(50,50,50,0.3)" stroke="currentColor" strokeWidth="1"/>
    <path d="M35 50 L41 50 M35 55 L41 55" stroke="currentColor" strokeWidth="0.7"/>
    {/* Arm with scythe */}
    <path d="M42 50 L52 45" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M52 45 L55 35" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M55 35 Q60 30 58 38" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {/* Black flag */}
    <path d="M34 50 L28 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M28 42 L28 30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M28 30 L22 33 L28 36Z" fill="rgba(0,0,0,0.5)" stroke="currentColor" strokeWidth="0.9"/>
    {/* White rose on flag */}
    <circle cx="24" cy="33" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* Fallen figures */}
    <path d="M5 75 L18 72 L20 75 L8 78Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <circle cx="6" cy="73" r="2" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    {/* Child with flowers */}
    <circle cx="62" cy="70" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.6"/>
    <path d="M62 72.5 L60 80 L64 80Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <path d="M60 75 L56 72" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    <circle cx="55" cy="71" r="2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
  </>,

  // XIV - Temperance: Angel pouring water between cups, rainbow, iris
  temperance: <>
    <defs>
      <linearGradient id="tempBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a1a0a" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#0a0a1e" stopOpacity="0.85"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#tempBg)"/>
    {/* Rainbow */}
    <path d="M5 60 Q40 20 75 60" fill="none" stroke="rgba(255,100,100,0.2)" strokeWidth="2"/>
    <path d="M8 62 Q40 25 72 62" fill="none" stroke="rgba(255,150,50,0.2)" strokeWidth="2"/>
    <path d="M11 64 Q40 30 69 64" fill="none" stroke="rgba(255,255,50,0.2)" strokeWidth="2"/>
    <path d="M14 66 Q40 35 66 66" fill="none" stroke="rgba(50,200,50,0.2)" strokeWidth="2"/>
    <path d="M17 68 Q40 40 63 68" fill="none" stroke="rgba(50,100,255,0.2)" strokeWidth="2"/>
    {/* Sun */}
    <circle cx="40" cy="18" r="7" fill="rgba(255,200,80,0.2)" stroke="rgba(255,200,80,0.4)" strokeWidth="0.9"/>
    <path d="M40 8 L40 5 M40 28 L40 31 M30 18 L27 18 M50 18 L53 18 M33 11 L31 9 M47 25 L49 27 M47 11 L49 9 M33 25 L31 27" stroke="rgba(255,200,80,0.4)" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Path to mountains */}
    <path d="M25 95 Q40 88 55 95 L55 110 Q40 103 25 110Z" fill="rgba(100,150,100,0.15)"/>
    <path d="M30 95 Q40 90 50 95" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4"/>
    {/* Mountains */}
    <path d="M0 80 L20 55 L35 68 L50 50 L65 62 L80 52 L80 80Z" fill="rgba(80,100,80,0.15)" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
    {/* Angel figure */}
    <circle cx="40" cy="45" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 47 Q40 48.5 41.5 47" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Wings */}
    <path d="M34.5 47 Q24 42 20 50 Q26 54 34.5 51" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1"/>
    <path d="M45.5 47 Q56 42 60 50 Q54 54 45.5 51" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 50.5 L33 72 L47 72Z" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 60 L46 60" stroke="currentColor" strokeWidth="0.8"/>
    {/* Triangle on robe */}
    <path d="M37 63 L40 58 L43 63Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms with cups */}
    <path d="M36 54 L26 60 M44 54 L54 58" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Cup left */}
    <path d="M22 58 L24 65 L30 65 L32 58" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M24 65 L26 68 M30 65 L28 68 M27 68 L27 72" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Cup right */}
    <path d="M50 56 L52 63 L58 63 L60 56" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M52 63 L54 66 M58 63 L56 66 M55 66 L55 70" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Water flowing */}
    <path d="M28 60 Q35 55 52 58" fill="none" stroke="rgba(100,150,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
    {/* Iris flowers */}
    {[[10,90],[70,90],[15,100],[65,100]].map(([x,y],i)=>(
      <g key={i}>
        <path d={`M${x} ${y+5} L${x} ${y-5}`} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
        <path d={`M${x-3} ${y} Q${x} ${y-5} ${x+3} ${y}`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
        <path d={`M${x-3} ${y} Q${x} ${y+5} ${x+3} ${y}`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
      </g>
    ))}
    {/* Halo */}
    <circle cx="40" cy="44" r="8" fill="none" stroke="rgba(255,200,80,0.3)" strokeWidth="0.8" strokeDasharray="2 2"/>
  </>,

  // XV - The Devil: Baphomet figure, chained figures, inverted pentagram
  devil: <>
    <defs>
      <linearGradient id="devBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050505" stopOpacity="0.99"/>
        <stop offset="100%" stopColor="#0a0505" stopOpacity="0.98"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#devBg)"/>
    {/* Dark background texture */}
    <path d="M0 0 Q40 20 80 0 L80 60 Q40 40 0 60Z" fill="rgba(80,0,0,0.1)"/>
    {/* Inverted pentagram */}
    <path d="M40 12 L44 22 L55 22 L46 28 L50 38 L40 32 L30 38 L34 28 L25 22 L36 22Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" transform="rotate(180,40,25)"/>
    {/* Pedestal */}
    <rect x="25" y="72" width="30" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M25 78 L55 78" stroke="currentColor" strokeWidth="0.7"/>
    {/* Devil body */}
    <path d="M40 48 L32 72 L48 72Z" fill="rgba(80,0,0,0.2)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M33 58 L47 58" stroke="currentColor" strokeWidth="0.8"/>
    {/* Devil head */}
    <circle cx="40" cy="40" r="6" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38" cy="38.5" r="0.8" fill="currentColor" opacity="0.8"/>
    <circle cx="42" cy="38.5" r="0.8" fill="currentColor" opacity="0.8"/>
    <path d="M38 43 Q40 45 42 43" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Horns */}
    <path d="M36 35 L32 26 L38 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M44 35 L48 26 L42 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Bat wings */}
    <path d="M34 50 Q20 42 15 52 Q20 58 34 54" fill="rgba(50,0,0,0.2)" stroke="currentColor" strokeWidth="1"/>
    <path d="M46 50 Q60 42 65 52 Q60 58 46 54" fill="rgba(50,0,0,0.2)" stroke="currentColor" strokeWidth="1"/>
    {/* Wing details */}
    <path d="M20 48 L28 52 M22 52 L30 55" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    <path d="M60 48 L52 52 M58 52 L50 55" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    {/* Arms raised */}
    <path d="M34 55 L24 48 M46 55 L56 48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Torch */}
    <path d="M56 48 L60 38" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M58 36 Q62 32 64 38 Q60 40 58 36Z" fill="rgba(255,100,0,0.2)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Chained figures */}
    {/* Left figure */}
    <circle cx="22" cy="88" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M22 91.5 L20 100 L24 100Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M22 91.5 L28 84" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2"/>
    {/* Right figure */}
    <circle cx="58" cy="88" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M58 91.5 L56 100 L60 100Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M58 91.5 L52 84" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2"/>
    {/* Chain */}
    <path d="M28 84 L40 80 L52 84" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 2"/>
    {/* Tail */}
    <path d="M40 72 Q44 78 42 85 Q40 90 44 95" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M44 95 Q46 98 44 100" fill="none" stroke="currentColor" strokeWidth="0.8"/>
  </>,

  // XVI - The Tower: Lightning-struck tower, falling figures
  tower: <>
    <defs>
      <linearGradient id="towBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050505" stopOpacity="0.99"/>
        <stop offset="100%" stopColor="#0a0505" stopOpacity="0.98"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#towBg)"/>
    {/* Dark stormy sky */}
    <path d="M0 0 Q20 15 40 10 Q60 5 80 15 L80 50 Q60 40 40 45 Q20 50 0 40Z" fill="rgba(50,30,0,0.2)"/>
    {/* Tower */}
    <rect x="26" y="30" width="28" height="75" rx="2" fill="rgba(100,80,50,0.15)" stroke="currentColor" strokeWidth="1.2"/>
    {/* Tower battlements */}
    <path d="M26 30 L26 22 L30 22 L30 26 L34 26 L34 22 L38 22 L38 26 L42 26 L42 22 L46 22 L46 26 L50 26 L50 22 L54 22 L54 30" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Crown on top (being blown off) */}
    <path d="M30 22 L35 15 L40 20 L45 15 L50 22" fill="rgba(255,200,50,0.15)" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    {/* Windows */}
    <rect x="33" y="40" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M36 40 L36 48 M33 44 L39 44" stroke="currentColor" strokeWidth="0.6"/>
    <rect x="41" y="40" width="6" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M44 40 L44 48 M41 44 L47 44" stroke="currentColor" strokeWidth="0.6"/>
    <rect x="33" y="58" width="14" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M40 58 L40 68 M33 63 L47 63" stroke="currentColor" strokeWidth="0.6"/>
    {/* Door */}
    <path d="M35 105 L35 90 Q40 86 45 90 L45 105" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Lightning bolt */}
    <path d="M55 8 L45 28 L52 28 L40 50" fill="none" stroke="rgba(255,200,50,0.7)" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M55 8 L45 28 L52 28 L40 50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinejoin="round"/>
    {/* Lightning glow */}
    <circle cx="48" cy="28" r="5" fill="rgba(255,200,50,0.1)"/>
    {/* Fire at top */}
    <path d="M30 22 Q32 15 35 20 Q37 12 40 18 Q43 12 45 20 Q48 15 50 22" fill="rgba(255,100,0,0.2)" stroke="rgba(255,150,50,0.5)" strokeWidth="0.8"/>
    {/* Falling figure 1 */}
    <circle cx="18" cy="55" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M18 58.5 L15 68 L21 68Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M16 62 L10 60 M20 62 L24 58" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Falling figure 2 */}
    <circle cx="62" cy="60" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M62 63.5 L59 73 L65 73Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M60 67 L54 65 M64 67 L68 63" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Yod symbols (flames) falling */}
    {[[12,35],[20,42],[60,38],[68,45],[15,70],[65,68]].map(([x,y],i)=>(
      <path key={i} d={`M${x} ${y} Q${x+2} ${y-4} ${x+1} ${y-8}`} fill="none" stroke="rgba(255,200,50,0.4)" strokeWidth="0.8" strokeLinecap="round"/>
    ))}
  </>,

  // XVII - The Star: Naked woman pouring water, large star, smaller stars
  star: <>
    <defs>
      <linearGradient id="starBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050510" stopOpacity="0.98"/>
        <stop offset="100%" stopColor="#0a0a20" stopOpacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#starBg)"/>
    {/* Large central star */}
    <path d="M40 8 L42.5 16 L51 16 L44.5 21 L47 29 L40 24 L33 29 L35.5 21 L29 16 L37.5 16Z" fill="none" stroke="rgba(255,220,100,0.7)" strokeWidth="1"/>
    <circle cx="40" cy="18" r="3" fill="rgba(255,220,100,0.3)"/>
    {/* 7 smaller stars */}
    {[[12,12],[20,8],[60,10],[68,15],[15,25],[65,22],[72,8]].map(([x,y],i)=>(
      <path key={i} d={`M${x} ${y-3} L${x+1} ${y} L${x+3.5} ${y} L${x+1.5} ${y+1.8} L${x+2.2} ${y+4.5} L${x} ${y+3} L${x-2.2} ${y+4.5} L${x-1.5} ${y+1.8} L${x-3.5} ${y} L${x-1} ${y}Z`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    ))}
    {/* Pool of water */}
    <ellipse cx="35" cy="92" rx="18" ry="8" fill="rgba(50,100,200,0.15)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Land */}
    <path d="M0 90 Q20 85 40 90 Q60 95 80 88 L80 120 L0 120Z" fill="rgba(50,80,30,0.15)"/>
    {/* Tree */}
    <path d="M65 120 L65 88" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="65" cy="84" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <circle cx="62" cy="80" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <circle cx="68" cy="80" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Bird on tree */}
    <path d="M63 76 Q65 73 67 76" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    {/* Kneeling figure */}
    <circle cx="35" cy="62" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="33.5" cy="60.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="36.5" cy="60.5" r="0.7" fill="currentColor" opacity="0.8"/>
    {/* Hair flowing */}
    <path d="M30 62 Q28 68 30 74" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Body kneeling */}
    <path d="M35 67 L30 78 L40 78Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M30 78 L28 85 M40 78 L42 85" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Arms with jugs */}
    <path d="M33 68 L22 72 M37 68 L48 70" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Left jug pouring into pool */}
    <path d="M18 70 L22 76 L26 76 L22 70Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M22 76 Q20 82 18 88" fill="none" stroke="rgba(100,150,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Right jug pouring on land */}
    <path d="M44 68 L48 74 L52 74 L48 68Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M48 74 Q50 80 52 88" fill="none" stroke="rgba(100,150,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Ripples in pool */}
    <ellipse cx="35" cy="92" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
    <ellipse cx="35" cy="92" rx="5" ry="2" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3"/>
  </>,

  // XVIII - The Moon: Moon with face, wolf and dog, crayfish, path
  moon: <>
    <defs>
      <linearGradient id="moonBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#020208" stopOpacity="0.99"/>
        <stop offset="100%" stopColor="#050510" stopOpacity="0.98"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#moonBg)"/>
    {/* Moon with face */}
    <circle cx="40" cy="20" r="14" fill="rgba(200,200,255,0.08)" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="40" cy="20" r="10" fill="rgba(200,200,255,0.05)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Moon face */}
    <circle cx="36" cy="18" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="44" cy="18" r="1.5" fill="currentColor" opacity="0.6"/>
    <path d="M36 23 Q40 26 44 23" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    <path d="M34 16 Q36 13 38 16" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Crescent within */}
    <path d="M30 20 A10 10 0 0 1 50 20 A6 6 0 0 0 30 20Z" fill="rgba(200,200,255,0.05)"/>
    {/* Yod drops falling */}
    {[[20,35],[28,38],[40,34],[52,38],[60,35]].map(([x,y],i)=>(
      <path key={i} d={`M${x} ${y} Q${x+1} ${y-3} ${x+0.5} ${y-6}`} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
    ))}
    {/* Two towers */}
    <rect x="8" y="60" width="8" height="35" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 60 L8 52 L12 55 L16 52 L16 60" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    <rect x="64" y="60" width="8" height="35" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M64 60 L64 52 L68 55 L72 52 L72 60" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    {/* Path between towers */}
    <path d="M16 95 Q40 88 64 95" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"/>
    <path d="M16 100 Q40 93 64 100" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3"/>
    {/* Pool */}
    <ellipse cx="40" cy="85" rx="20" ry="8" fill="rgba(50,50,150,0.15)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Crayfish emerging */}
    <circle cx="40" cy="82" r="3" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M37 82 L33 78 M43 82 L47 78" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <path d="M37 84 L34 88 M43 84 L46 88" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <path d="M38 85 L36 90 M42 85 L44 90" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Wolf (left) */}
    <circle cx="22" cy="68" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M20 65 Q22 60 24 65" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M22 72 L18 80 L22 80 L22 85 M22 72 L26 80 L22 80" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M22 68 L18 65" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Dog (right) */}
    <circle cx="58" cy="68" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M56 65 Q58 60 60 65" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M58 72 L54 80 L58 80 L58 85 M58 72 L62 80 L58 80" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M62 66 L66 63" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
  </>,

  // XIX - The Sun: Radiant sun, child on horse, sunflowers
  sun: <>
    <defs>
      <linearGradient id="sunBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a1000" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#0a1a0a" stopOpacity="0.85"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#sunBg)"/>
    {/* Sun */}
    <circle cx="40" cy="22" r="14" fill="rgba(255,200,50,0.15)" stroke="rgba(255,200,50,0.5)" strokeWidth="1.2"/>
    <circle cx="40" cy="22" r="9" fill="rgba(255,200,50,0.2)"/>
    <circle cx="40" cy="22" r="5" fill="rgba(255,200,50,0.3)"/>
    {/* Sun rays - alternating straight and wavy */}
    {[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map((a,i)=>(
      i % 2 === 0 ?
      <line key={i} x1={40+15*Math.cos(a*Math.PI/180)} y1={22+15*Math.sin(a*Math.PI/180)}
        x2={40+22*Math.cos(a*Math.PI/180)} y2={22+22*Math.sin(a*Math.PI/180)}
        stroke="rgba(255,200,50,0.5)" strokeWidth="1.2" strokeLinecap="round"/> :
      <path key={i} d={`M${40+15*Math.cos(a*Math.PI/180)} ${22+15*Math.sin(a*Math.PI/180)} Q${40+18*Math.cos((a+5)*Math.PI/180)} ${22+18*Math.sin((a+5)*Math.PI/180)} ${40+22*Math.cos(a*Math.PI/180)} ${22+22*Math.sin(a*Math.PI/180)}`} fill="none" stroke="rgba(255,200,50,0.4)" strokeWidth="1" strokeLinecap="round"/>
    ))}
    {/* Sun face */}
    <circle cx="37.5" cy="20" r="1.2" fill="rgba(255,200,50,0.6)"/>
    <circle cx="42.5" cy="20" r="1.2" fill="rgba(255,200,50,0.6)"/>
    <path d="M37.5 24 Q40 26 42.5 24" fill="none" stroke="rgba(255,200,50,0.6)" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Wall */}
    <path d="M5 85 L75 85 L75 120 L5 120Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M5 85 L75 85" stroke="currentColor" strokeWidth="1.2"/>
    {[15,25,35,45,55,65].map((x,i)=>(
      <path key={i} d={`M${x} 85 L${x} 120`} stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
    ))}
    {/* Sunflowers on wall */}
    {[10,20,60,70].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 85 L${x} 72`} stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
        <circle cx={x} cy={70} r="4" fill="none" stroke="currentColor" strokeWidth="0.8"/>
        <circle cx={x} cy={70} r="1.5" fill="currentColor" opacity="0.4"/>
        {[0,45,90,135].map((a,j)=>(
          <ellipse key={j} cx={x+3.5*Math.cos(a*Math.PI/180)} cy={70+3.5*Math.sin(a*Math.PI/180)} rx="2" ry="1" fill="none" stroke="currentColor" strokeWidth="0.6" transform={`rotate(${a},${x+3.5*Math.cos(a*Math.PI/180)},${70+3.5*Math.sin(a*Math.PI/180)})`}/>
        ))}
      </g>
    ))}
    {/* White horse */}
    <path d="M25 80 L30 70 L45 68 L55 72 L58 80 L50 88 L30 88Z" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1"/>
    <path d="M55 72 L60 65 L65 68 L60 72Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="62" cy="65" r="1" fill="currentColor" opacity="0.6"/>
    <path d="M30 88 L28 95 M40 88 L38 95 M50 88 L48 95" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Child on horse */}
    <circle cx="42" cy="60" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="40.5" cy="58.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <circle cx="43.5" cy="58.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <path d="M40.5 62 Q42 63.5 43.5 62" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Feather on head */}
    <path d="M42 55.5 Q44 50 46 52 Q44 55 42 55.5Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Child body */}
    <path d="M42 64.5 L40 73 L44 73Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Red banner */}
    <path d="M44 62 L50 55" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M50 55 L50 45" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M50 45 L58 48 L50 51Z" fill="rgba(200,50,50,0.2)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Arms spread */}
    <path d="M40 67 L34 62 M44 67 L50 62" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  // XX - Judgement: Angel with trumpet, rising figures, coffins
  judgement: <>
    <defs>
      <linearGradient id="judgBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050510" stopOpacity="0.98"/>
        <stop offset="100%" stopColor="#0a0520" stopOpacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#judgBg)"/>
    {/* Clouds */}
    <path d="M5 20 Q15 15 25 20 Q30 15 40 18 Q50 12 60 18 Q70 15 75 22 Q65 28 55 24 Q45 30 35 25 Q25 30 15 26 Q8 28 5 20Z" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Angel */}
    <circle cx="40" cy="18" r="5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="38.5" cy="16.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="16.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 20 Q40 21.5 41.5 20" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Angel hair */}
    <path d="M35 18 Q38 13 42 15 Q44 13 45 18" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Angel wings */}
    <path d="M35 20 Q22 15 18 24 Q24 28 35 24" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1"/>
    <path d="M45 20 Q58 15 62 24 Q56 28 45 24" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 23 L36 35 L44 35Z" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Trumpet */}
    <path d="M44 22 L55 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M55 15 L62 10 L64 14 L58 18Z" fill="rgba(255,200,50,0.15)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Banner on trumpet */}
    <path d="M58 12 L58 8 L64 10 L58 12Z" fill="rgba(255,255,255,0.1)" stroke="currentColor" strokeWidth="0.7"/>
    <path d="M59 9 L63 10 M59 11 L62 11" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
    {/* Halo */}
    <circle cx="40" cy="17" r="8" fill="none" stroke="rgba(255,200,50,0.3)" strokeWidth="0.8" strokeDasharray="2 2"/>
    {/* Ocean/water */}
    <path d="M0 80 Q20 75 40 80 Q60 85 80 78 L80 100 Q60 95 40 100 Q20 105 0 98Z" fill="rgba(50,80,150,0.15)"/>
    {/* Coffins */}
    <rect x="10" y="75" width="14" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <rect x="33" y="73" width="14" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <rect x="56" y="75" width="14" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Rising figures */}
    {/* Center figure (arms raised) */}
    <circle cx="40" cy="58" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="38.5" cy="56.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="56.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <path d="M40 62 L38 70 L42 70Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M38 64 L32 58 M42 64 L48 58" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Left figure */}
    <circle cx="17" cy="62" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M17 65.5 L15 73 L19 73Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M15 67 L10 63 M19 67 L24 63" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Right figure */}
    <circle cx="63" cy="62" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M63 65.5 L61 73 L65 73Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M61 67 L56 63 M65 67 L70 63" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Mountains in background */}
    <path d="M0 80 L15 62 L25 72 L35 58 L45 70 L55 60 L65 72 L80 62 L80 80Z" fill="rgba(80,80,100,0.1)" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
  </>,

  // XXI - The World: Dancing figure in wreath, four creatures
  world: <>
    <defs>
      <linearGradient id="worldBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#050510" stopOpacity="0.98"/>
        <stop offset="100%" stopColor="#0a0520" stopOpacity="0.95"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#worldBg)"/>
    {/* Stars */}
    {[[8,8],[15,5],[65,8],[72,5],[5,20],[75,18]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.8" fill="currentColor" opacity="0.5"/>
    ))}
    {/* Four corner creatures */}
    {/* Angel top-left */}
    <circle cx="10" cy="15" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <path d="M8 19 L6 26 L14 26 L12 19Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.6"/>
    <path d="M6 21 Q4 17 8 16 M14 21 Q16 17 12 16" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    {/* Eagle top-right */}
    <path d="M68 10 Q74 8 76 14 Q72 18 68 14 Q64 10 68 10Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <path d="M72 14 L74 20" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    <path d="M68 10 L66 6 M70 9 L70 5" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Lion bottom-left */}
    <circle cx="10" cy="100" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <path d="M8 96 Q6 92 10 91 Q14 92 12 96" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    <path d="M10 104 L8 110 M10 104 L12 110" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    {/* Bull bottom-right */}
    <path d="M66 96 L70 96 L72 100 L70 104 L66 104 L64 100Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <path d="M66 96 Q64 92 68 91 M70 96 Q72 92 68 91" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Laurel wreath (oval) */}
    <ellipse cx="40" cy="62" rx="22" ry="30" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <ellipse cx="40" cy="62" rx="19" ry="27" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 2"/>
    {/* Leaves on wreath */}
    {Array.from({length:20},(_, i)=>{
      const a = (i/20)*360*Math.PI/180
      const r = 22, cx2 = 40+r*Math.cos(a), cy2 = 62+r*Math.sin(a)
      return <ellipse key={i} cx={cx2} cy={cy2} rx="2.5" ry="1.2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5" transform={`rotate(${i*18},${cx2},${cy2})`}/>
    })}
    {/* Ribbon at top and bottom of wreath */}
    <path d="M30 32 Q40 28 50 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M30 92 Q40 96 50 92" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Dancing figure */}
    <circle cx="40" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 50 Q40 51.5 41.5 50" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Flowing scarf */}
    <path d="M35 50 Q28 46 25 52 Q30 56 35 54" fill="rgba(200,100,100,0.1)" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M45 50 Q52 46 55 52 Q50 56 45 54" fill="rgba(200,100,100,0.1)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Body dancing */}
    <path d="M40 53 L36 68 L44 68Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Arms with wands */}
    <path d="M36 56 L26 50 M44 56 L54 50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M26 50 L24 42" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M54 50 L56 42" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <circle cx="24" cy="41" r="1.5" fill="currentColor" opacity="0.5"/>
    <circle cx="56" cy="41" r="1.5" fill="currentColor" opacity="0.5"/>
    {/* Legs dancing */}
    <path d="M38 68 L34 80 M42 68 L46 78" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M34 80 L30 85 M46 78 L50 82" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </>,

  // ══════════════════════════════════════════════════════════════
  // MINOR ARCANA - WANDS (Fire, Salamanders, Wands)
  // ══════════════════════════════════════════════════════════════

  wands_ace: <>
    <defs><linearGradient id="wAceBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#wAceBg)"/>
    {/* Clouds */}
    <path d="M10 30 Q20 24 30 28 Q35 22 45 26 Q55 20 65 26 Q72 22 75 30
 Q80 26 80 35" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="0.7"/>
    {/* Hand from cloud */}
    <path d="M35 30 L38 22 L42 22 L45 30" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M38 22 L38 18 M40 22 L40 17 M42 22 L42 18" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.6"/>
    {/* Wand */}
    <path d="M40 30 L40 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* Leaves sprouting from wand */}
    {[35,45,55,65,75].map((y,i)=>(
      <g key={i}>
        <path d={`M40 ${y} Q${i%2===0?30:50} ${y-5} ${i%2===0?28:52} ${y-10}`} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
        <path d={`M40 ${y} Q${i%2===0?50:30} ${y-5} ${i%2===0?52:28} ${y-10}`} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      </g>
    ))}
    {/* Landscape */}
    <path d="M0 95 Q20 88 40 92 Q60 96 80 90 L80 120 L0 120Z" fill="rgba(50,80,30,0.15)"/>
    <path d="M5 90 L18 75 L28 82 L38 70 L48 80 L58 72 L72 82 L80 75 L80 90Z" fill="rgba(80,100,50,0.1)" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
  </>,

  wands_2: <>
    <defs><linearGradient id="w2Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w2Bg)"/>
    {/* Castle battlements */}
    <path d="M5 40 L5 30 L10 30 L10 35 L15 35 L15 30 L20 30 L20 40" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M5 40 L20 40 L20 90 L5 90Z" fill="rgba(100,80,50,0.1)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Figure on battlements */}
    <circle cx="12" cy="45" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M12 49 L10 60 L14 60Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M10 52 L6 50 M14 52 L18 50" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Two wands */}
    <path d="M6 50 L6 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="6" cy="28" r="2" fill="currentColor" opacity="0.5"/>
    <path d="M18 50 L18 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="18" cy="28" r="2" fill="currentColor" opacity="0.5"/>
    {/* Globe */}
    <circle cx="12" cy="55" r="5" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M12 50 L12 60 M7 55 L17 55" stroke="currentColor" strokeWidth="0.6"/>
    <path d="M9 52 Q12 50 15 52 M9 58 Q12 60 15 58" fill="none" stroke="currentColor" strokeWidth="0.6"/>
    {/* Landscape with sea */}
    <path d="M20 70 Q50 60 80 65 L80 120 L20 120Z" fill="rgba(50,80,150,0.1)"/>
    <path d="M20 65 Q40 58 60 62 Q70 60 80 63" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Mountains */}
    <path d="M25 65 L40 45 L55 60 L70 48 L80 55 L80 65Z" fill="rgba(80,100,50,0.1)" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
  </>,

  wands_3: <>
    <defs><linearGradient id="w3Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w3Bg)"/>
    {/* Three wands */}
    <path d="M25 15 L25 95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M40 10 L40 90" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M55 15 L55 95" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    {/* Wand tops */}
    <circle cx="25" cy="13" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <circle cx="40" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <circle cx="55" cy="13" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Figure standing, looking out */}
    <circle cx="40" cy="45" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M40 50 L37 62 L43 62Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M38 54 L32 52 M42 54 L48 52" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Cloak */}
    <path d="M35 50 Q30 55 32 65 M45 50 Q50 55 48 65" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Ships on sea */}
    <path d="M0 85 Q20 80 40 85 Q60 90 80 85 L80 100 Q60 95 40 100 Q20 105 0 100Z" fill="rgba(50,80,150,0.1)"/>
    <path d="M15 85 L18 78 L21 85Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M18 78 L18 72" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    <path d="M55 83 L58 76 L61 83Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M58 76 L58 70" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
  </>,

  wands_4: <>
    <defs><linearGradient id="w4Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w4Bg)"/>
    {/* Four wands forming archway */}
    <path d="M15 20 L15 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 15 L30 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M50 15 L50 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M65 20 L65 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* Garland connecting wands */}
    <path d="M15 35 Q22 28 30 35 Q38 28 50 35 Q58 28 65 35" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M15 45 Q22 38 30 45 Q38 38 50 45 Q58 38 65 45" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Flowers on garland */}
    {[22,40,57].map((x,i)=>(
      <g key={i}>
        <circle cx={x} cy={30} r="2.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
        <circle cx={x} cy={30} r="1" fill="currentColor" opacity="0.3"/>
      </g>
    ))}
    {/* Castle in background */}
    <rect x="28" y="60" width="24" height="30" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M28 60 L28 52 L34 52 L34 56 L38 56 L38 52 L42 52 L42 56 L46 56 L46 52 L52 52 L52 60" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    {/* Celebrating figures */}
    <circle cx="22" cy="72" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M22 75.5 L20 83 L24 83Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M20 78 L16 75 M24 78 L28 75" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="58" cy="72" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M58 75.5 L56 83 L60 83Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M56 78 L52 75 M60 78 L64 75" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Flowers they're holding */}
    <circle cx="16" cy="74" r="2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.6"/>
    <circle cx="64" cy="74" r="2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.6"/>
  </>,

  wands_5: <>
    <defs><linearGradient id="w5Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w5Bg)"/>
    {/* Five figures in conflict */}
    {/* Figure 1 */}
    <circle cx="20" cy="45" r="4" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M20 49 L18 60 L22 60Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M18 52 L12 48 M22 52 L30 45" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M30 45 L35 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Figure 2 */}
    <circle cx="40" cy="38" r="4" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M40 42 L38 53 L42 53Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M38 46 L30 42 M42 46 L50 42" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M30 42 L25 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M50 42 L55 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Figure 3 */}
    <circle cx="60" cy="45" r="4" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M60 49 L58 60 L62 60Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M58 52 L50 48 M62 52 L68 48" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M50 48 L45 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Figure 4 */}
    <circle cx="15" cy="68" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M15 71.5 L13 80 L17 80Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M13 74 L8 70 M17 74 L22 68" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M22 68 L28 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Figure 5 */}
    <circle cx="65" cy="68" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M65 71.5 L63 80 L67 80Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M63 74 L58 70 M67 74 L72 68" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M58 70 L52 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Wands crossing */}
    <path d="M12 48 L68 48" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 3"/>
  </>,

  wands_6: <>
    <defs><linearGradient id="w6Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w6Bg)"/>
    {/* Victory rider on horse */}
    <path d="M20 70 L25 58 L45 55 L60 60 L62 72 L50 80 L25 80Z" fill="rgba(200,150,50,0.08)" stroke="currentColor" strokeWidth="1"/>
    <path d="M60 60 L68 52 L72 56 L65 62Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="70" cy="51" r="1.5" fill="currentColor" opacity="0.6"/>
    <path d="M25 80 L22 90 M40 80 L38 90 M55 80 L53 90" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Rider */}
    <circle cx="42" cy="45" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="40.5" cy="43.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <circle cx="43.5" cy="43.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <path d="M40.5 47 Q42 48.5 43.5 47" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Laurel wreath */}
    <circle cx="42" cy="44" r="6.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2 2" opacity="0.5"/>
    {/* Victory wand with wreath */}
    <path d="M45 48 L52 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="52" cy="30" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M49 28 Q52 24 55 28" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Five followers with wands */}
    {[12,22,55,65,72].map((x,i)=>(
      <g key={i}>
        <circle cx={x} cy={i<2?72:68} r="3" fill="none" stroke="currentColor" strokeWidth="0.9"/>
        <path d={`M${x} ${i<2?75:71} L${x-2} ${i<2?83:79} L${x+2} ${i<2?83:79}Z`} fill="none" stroke="currentColor" strokeWidth="0.8"/>
        <path d={`M${x} ${i<2?73:69} L${x} ${i<2?60:56}`} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </g>
    ))}
  </>,

  wands_7: <>
    <defs><linearGradient id="w7Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w7Bg)"/>
    {/* High ground */}
    <path d="M0 75 Q20 65 40 70 Q60 75 80 68 L80 120 L0 120Z" fill="rgba(80,100,50,0.15)"/>
    {/* Defending figure on high ground */}
    <circle cx="40" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 50 Q40 51.5 41.5 50" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <path d="M40 53 L37 65 L43 65Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Main wand raised */}
    <path d="M44 52 L52 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="52" cy="26" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M36 52 L30 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Six attacking wands from below */}
    {[10,20,30,50,60,70].map((x,i)=>(
      <path key={i} d={`M${x} 120 L${x+5} 75`} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
    ))}
    {/* Attackers partially visible */}
    {[12,35,62].map((x,i)=>(
      <circle key={i} cx={x} cy={90} r="3" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    ))}
  </>,

  wands_8: <>
    <defs><linearGradient id="w8Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w8Bg)"/>
    {/* Eight wands flying through air in parallel */}
    {[0,1,2,3,4,5,6,7].map((i)=>(
      <g key={i}>
        <path d={`M${8+i*9} 15 L${5+i*9} 85`} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx={8+i*9} cy={13} r="2" fill="none" stroke="currentColor" strokeWidth="0.9"/>
        {/* Leaves */}
        <path d={`M${8+i*9} ${30+i*5} Q${8+i*9-6} ${28+i*5} ${8+i*9-8} ${22+i*5}`} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
        <path d={`M${8+i*9} ${30+i*5} Q${8+i*9+6} ${28+i*5} ${8+i*9+8} ${22+i*5}`} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      </g>
    ))}
    {/* Landscape below */}
    <path d="M0 90 Q20 85 40 88 Q60 91 80 87 L80 120 L0 120Z" fill="rgba(50,80,30,0.15)"/>
    <path d="M0 88 L15 75 L25 80 L40 70 L55 78 L70 72 L80 76 L80 88Z" fill="rgba(80,100,50,0.1)" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
    {/* River */}
    <path d="M30 100 Q40 95 50 100 Q55 105 60 110" fill="none" stroke="rgba(100,150,200,0.3)" strokeWidth="2" strokeLinecap="round"/>
  </>,

  wands_9: <>
    <defs><linearGradient id="w9Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w9Bg)"/>
    {/* Eight wands as fence/barrier */}
    {[8,18,28,38,48,58,68,76].map((x,i)=>(
      <path key={i} d={`M${x} 20 L${x} 90`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    ))}
    {/* Wounded figure leaning on main wand */}
    <circle cx="40" cy="45" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 47 Q40 48.5 41.5 47" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Bandage on head */}
    <path d="M35 43 Q40 39 45 43" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Weary posture */}
    <path d="M40 50 L37 65 L43 65Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M37 55 L30 52 M43 55 L48 50" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Main wand being leaned on */}
    <path d="M48 50 L48 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="48" cy="18" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Legs */}
    <path d="M38 65 L36 78 M42 65 L44 78" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Ground */}
    <path d="M0 90 Q40 85 80 90 L80 120 L0 120Z" fill="rgba(50,80,30,0.1)"/>
  </>,

  wands_10: <>
    <defs><linearGradient id="w10Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#w10Bg)"/>
    {/* Town in background */}
    <rect x="50" y="65" width="8" height="15" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M50 65 L54 58 L58 65" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <rect x="60" y="68" width="6" height="12" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Burdened figure carrying 10 wands */}
    <circle cx="30" cy="55" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Face looking down */}
    <circle cx="28.5" cy="53.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="31.5" cy="53.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M28.5 57 Q30 58 31.5 57" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Body bent forward */}
    <path d="M30 60 L28 72 L32 72Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M28 65 L24 63 M32 65 L38 60" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Ten wands bundled */}
    {[28,31,34,37,40,43,46,49,52,55].map((x,i)=>(
      <path key={i} d={`M${x} 60 L${x-5} 20`} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity={0.5+i*0.05}/>
    ))}
    {/* Legs */}
    <path d="M28 72 L26 85 M32 72 L34 85" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Ground path */}
    <path d="M0 90 Q30 85 60 88 Q70 87 80 90 L80 120 L0 120Z" fill="rgba(50,80,30,0.1)"/>
  </>,

  wands_page: <>
    <defs><linearGradient id="wPgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#wPgBg)"/>
    {/* Pyramids in background */}
    <path d="M5 80 L20 55 L35 80Z" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M45 80 L58 58 L70 80Z" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Salamander on tunic */}
    <path d="M35 65 Q30 60 32 55 Q36 52 38 58 Q40 52 44 55 Q46 60 42 65Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    {/* Figure */}
    <circle cx="40" cy="40" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="38.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="38.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 42 Q40 43.5 41.5 42" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Hat with feather */}
    <path d="M34 37 Q40 31 46 37" fill="rgba(200,100,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M44 35 Q48 28 46 24 Q42 28 44 35" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Tunic */}
    <path d="M40 45.5 L34 68 L46 68Z" fill="rgba(200,100,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M35 55 L45 55" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 50 L28 55 M44 50 L52 48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Wand held upright */}
    <path d="M52 48 L55 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="55" cy="18" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Leaves on wand */}
    <path d="M55 30 Q48 26 46 20 M55 30 Q62 26 64 20" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.6"/>
    {/* Legs */}
    <path d="M36 68 L34 82 M44 68 L46 82" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Ground */}
    <path d="M0 88 Q40 82 80 88 L80 120 L0 120Z" fill="rgba(200,150,50,0.08)"/>
  </>,

  wands_knight: <>
    <defs><linearGradient id="wKnBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#wKnBg)"/>
    {/* Desert landscape */}
    <path d="M0 85 Q20 78 40 82 Q60 86 80 80 L80 120 L0 120Z" fill="rgba(200,150,50,0.1)"/>
    <path d="M5 80 L18 65 L28 72 L38 62 L48 70 L58 63 L72 70 L80 65 L80 80Z" fill="rgba(200,150,50,0.08)" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
    {/* Horse rearing */}
    <path d="M15 75 L20 60 L35 55 L55 58 L60 68 L55 80 L30 82Z" fill="rgba(200,150,50,0.08)" stroke="currentColor" strokeWidth="1"/>
    <path d="M55 58 L62 48 L68 52 L62 60Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="65" cy="47" r="1.5" fill="currentColor" opacity="0.6"/>
    <path d="M20 82 L18 92 M35 82 L33 92 M50 80 L48 90" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Knight */}
    <circle cx="38" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Helmet with plume */}
    <path d="M33 39 Q38 33 43 39" fill="rgba(200,100,50,0.2)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M40 35 Q44 28 42 22 Q38 28 40 35" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Armor */}
    <path d="M38 47 L34 60 L42 60Z" fill="rgba(150,150,200,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M35 52 L41 52" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M34 50 L26 46 M42 50 L52 44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Wand raised charging */}
    <path d="M52 44 L58 25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="58" cy="23" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Leaves on wand */}
    <path d="M58 35 Q52 30 50 24 M58 35 Q64 30 66 24" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.6"/>
    {/* Salamanders on armor */}
    <path d="M35 54 Q33 52 34 50 Q36 49 36 52Z" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
  </>,

  wands_queen: <>
    <defs><linearGradient id="wQnBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#wQnBg)"/>
    {/* Sunflowers on throne */}
    {[12,68].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 90 L${x} 70`} stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        <circle cx={x} cy={68} r="5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
        <circle cx={x} cy={68} r="2" fill="currentColor" opacity="0.3"/>
      </g>
    ))}
    {/* Throne */}
    <rect x="22" y="55" width="36" height="50" rx="2" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
    <path d="M22 55 L22 45 L28 50 L40 42 L52 50 L58 45 L58 55" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    {/* Black cat at feet */}
    <path d="M28 95 L32 88 L36 90 L38 95Z" fill="rgba(0,0,0,0.3)" stroke="currentColor" strokeWidth="0.8"/>
    <circle cx="30" cy="86" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M28 84 Q30 81 32 84" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    <circle cx="29" cy="85" r="0.5" fill="currentColor" opacity="0.6"/>
    <circle cx="31" cy="85" r="0.5" fill="currentColor" opacity="0.6"/>
    {/* Queen figure */}
    <circle cx="40" cy="42" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M34 38 L36 32 L40 36 L44 32 L46 38" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M34 38 L46 38" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 47.5 L33 72 L47 72Z" fill="rgba(200,100,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 58 L46 58" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 52 L26 58 M44 52 L54 50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Wand */}
    <path d="M54 50 L58 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="58" cy="28" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Sunflower in other hand */}
    <circle cx="26" cy="58" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <circle cx="26" cy="58" r="1.2" fill="currentColor" opacity="0.3"/>
    {/* Legs */}
    <path d="M35 72 L33 85 M45 72 L47 85" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  wands_king: <>
    <defs><linearGradient id="wKgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0800" stopOpacity="0.9"/><stop offset="100%" stopColor="#0a0500" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#wKgBg)"/>
    {/* Throne with salamanders */}
    <rect x="20" y="50" width="40" height="55" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M20 50 L20 38 L28 44 L40 36 L52 44 L60 38 L60 50" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Salamander on throne back */}
    <path d="M25 55 Q22 52 23 48 Q27 46 27 52Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M55 55 Q58 52 57 48 Q53 46 53 52Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    {/* King figure */}
    <circle cx="40" cy="42" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Beard */}
    <path d="M37 46 Q40 50 43 46" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <path d="M38 47 L38 52 M40 48 L40 53 M42 47 L42 52" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.5"/>
    {/* Crown */}
    <path d="M34 38 L36 30 L40 35 L44 30 L46 38" fill="rgba(200,150,50,0.2)" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M34 38 L46 38" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 47.5 L33 72 L47 72Z" fill="rgba(200,100,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M34 57 L46 57 M34 63 L46 63" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 52 L26 58 M44 52 L54 50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Wand scepter */}
    <path d="M54 50 L58 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="58" cy="26" r="3" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M55 26 L61 26 M58 23 L58 29" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Orb */}
    <circle cx="26" cy="58" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M26 54 L26 62 M22 58 L30 58" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M35 72 L33 85 M45 72 L47 85" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  // ══════════════════════════════════════════════════════════════
  // MINOR ARCANA - CUPS (Water, Emotions)
  // ══════════════════════════════════════════════════════════════

  cups_ace: <>
    <defs><linearGradient id="cAceBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#cAceBg)"/>
    {/* Clouds */}
    <path d="M10 28 Q20 22 30 26 Q38 20 48 24 Q58 18 68 24 Q75 20 78 28" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="0.7"/>
    {/* Hand from cloud */}
    <path d="M33 28 L36 20 L44 20 L47 28" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Cup */}
    <path d="M28 40 L25 65 L55 65 L52 40Z" fill="rgba(50,100,200,0.1)" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M25 65 L28 72 L52 72 L55 65" fill="rgba(50,100,200,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M28 72 L35 78 L45 78 L52 72" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M35 78 L38 85 L42 85 L45 78" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Water overflowing */}
    <path d="M28 50 Q20 55 15 65 Q18 70 22 65 Q25 58 28 55" fill="rgba(50,100,200,0.1)" stroke="rgba(100,150,255,0.4)" strokeWidth="0.8"/>
    <path d="M52 50 Q60 55 65 65 Q62 70 58 65 Q55 58 52 55" fill="rgba(50,100,200,0.1)" stroke="rgba(100,150,255,0.4)" strokeWidth="0.8"/>
    {/* Dove with wafer */}
    <path d="M36 38 Q40 32 44 38" fill="rgba(255,255,255,0.08)" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="40" cy="36" r="2" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M40 38 L40 42" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Cross on wafer */}
    <path d="M38 40 L42 40 M40 38 L40 42" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Water/lotus below */}
    <path d="M0 90 Q20 85 40 88 Q60 91 80 87 L80 120 L0 120Z" fill="rgba(50,100,200,0.1)"/>
    {/* Lotus flowers */}
    {[20,40,60].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 95 Q${x-5} 88 ${x} 85 Q${x+5} 88 ${x} 95`} fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
        <path d={`M${x} 95 Q${x-8} 90 ${x-5} 85 Q${x-2} 90 ${x} 95`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
        <path d={`M${x} 95 Q${x+8} 90 ${x+5} 85 Q${x+2} 90 ${x} 95`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
      </g>
    ))}
  </>,

  cups_2: <>
    <defs><linearGradient id="c2Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c2Bg)"/>
    {/* Two figures facing each other */}
    <circle cx="25" cy="45" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="23.5" cy="43.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <circle cx="26.5" cy="43.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <path d="M23.5 47 Q25 48.5 26.5 47" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    <path d="M25 49.5 L22 62 L28 62Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M23 53 L17 50 M27 53 L32 50" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <circle cx="55" cy="45" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="53.5" cy="43.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <circle cx="56.5" cy="43.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <path d="M53.5 47 Q55 48.5 56.5 47" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    <path d="M55 49.5 L52 62 L58 62Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M53 53 L48 50 M57 53 L63 50" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Two cups being exchanged */}
    <path d="M17 50 L14 56 L20 56 L17 50Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M63 50 L60 56 L66 56 L63 50Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Caduceus between them */}
    <path d="M40 30 L40 75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M35 35 Q40 40 45 35 Q50 30 45 25 Q40 20 35 25 Q30 30 35 35Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Winged lion head */}
    <circle cx="40" cy="22" r="4" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M36 20 Q40 16 44 20" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M36 22 Q34 18 36 16 M44 22 Q46 18 44 16" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* Legs */}
    <path d="M23 62 L21 75 M27 62 L29 75" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M53 62 L51 75 M57 62 L59 75" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* House in background */}
    <rect x="30" y="80" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M28 80 L40 70 L52 80" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
  </>,

  cups_3: <>
    <defs><linearGradient id="c3Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c3Bg)"/>
    {/* Three women dancing */}
    {[20,40,60].map((x,i)=>(
      <g key={i}>
        <circle cx={x} cy={45} r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx={x-1.5} cy={43.5} r="0.6" fill="currentColor" opacity="0.8"/>
        <circle cx={x+1.5} cy={43.5} r="0.6" fill="currentColor" opacity="0.8"/>
        <path d={`M${x-1.5} 47 Q${x} 48.5 ${x+1.5} 47`} fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
        <path d={`M${x} 49.5 L${x-3} 62 L${x+3} 62Z`} fill="none" stroke="currentColor" strokeWidth="1"/>
        {/* Raised cup */}
        <path d={`M${x+3} 52 L${x+8} 45`} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        <path d={`M${x+5} 43 L${x+8} 43 L${x+11} 43 L${x+8} 45Z`} fill="none" stroke="currentColor" strokeWidth="0.9"/>
        {/* Other arm linking */}
        <path d={`M${x-3} 52 L${x-8} 50`} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        {/* Flowing dress */}
        <path d={`M${x-3} 62 L${x-5} 75 M${x+3} 62 L${x+5} 75`} stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </g>
    ))}
    {/* Harvest abundance below */}
    <path d="M0 85 Q40 78 80 85 L80 120 L0 120Z" fill="rgba(50,80,30,0.1)"/>
    {/* Fruits and flowers */}
    {[10,25,40,55,70].map((x,i)=>(
      <g key={i}>
        <circle cx={x} cy={90} r="3" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
        <path d={`M${x} 87 L${x} 82`} stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
      </g>
    ))}
    {/* Pumpkins */}
    <path d="M15 95 Q15 88 22 88 Q29 88 29 95 Q29 102 22 102 Q15 102 15 95Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M50 95 Q50 88 57 88 Q64 88 64 95 Q64 102 57 102 Q50 102 50 95Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
  </>,

  cups_4: <>
    <defs><linearGradient id="c4Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c4Bg)"/>
    {/* Tree */}
    <path d="M40 120 L40 65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="40" cy="58" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <circle cx="32" cy="52" r="8" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
    <circle cx="48" cy="52" r="8" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
    {/* Figure sitting under tree, arms crossed */}
    <circle cx="40" cy="68" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="66.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="66.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 70 Q40 71 41.5 70" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Crossed arms (contemplative) */}
    <path d="M35 73 L28 72 M45 73 L52 72" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M28 72 Q32 76 36 74 M52 72 Q48 76 44 74" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Legs crossed */}
    <path d="M38 78 L34 88 L42 88 L38 78Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Three cups on ground */}
    {[12,22,32].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 85 L${x-3} 92 L${x+3} 92 L${x} 85Z`} fill="none" stroke="currentColor" strokeWidth="0.9"/>
        <path d={`M${x-3} 92 L${x-2} 95 L${x+2} 95 L${x+3} 92`} fill="none" stroke="currentColor" strokeWidth="0.8"/>
      </g>
    ))}
    {/* Fourth cup offered from cloud */}
    <path d="M55 45 Q62 38 68 42 Q72 38 75 42 Q78 38 78 45" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="0.7"/>
    <path d="M62 45 L60 52 L66 52 L64 45Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M60 52 L61 55 L65 55 L66 52" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arm from cloud */}
    <path d="M62 45 L58 40 L56 42 L60 48" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="0.8"/>
  </>,

  cups_5: <>
    <defs><linearGradient id="c5Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c5Bg)"/>
    {/* River */}
    <path d="M35 50 Q40 55 38 70 Q36 85 40 100 Q44 115 42 120" fill="none" stroke="rgba(100,150,200,0.3)" strokeWidth="4" strokeLinecap="round"/>
    {/* Bridge */}
    <path d="M25 75 Q35 70 45 75" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M25 75 L25 85 M45 75 L45 85" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Castle in background */}
    <rect x="55" y="55" width="18" height="25" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M55 55 L55 48 L60 51 L64 46 L68 51 L73 48 L73 55" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    {/* Cloaked mourning figure */}
    <circle cx="35" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Hood */}
    <path d="M30 40 Q35 34 40 40" fill="rgba(50,50,100,0.2)" stroke="currentColor" strokeWidth="1.1"/>
    {/* Cloak body */}
    <path d="M35 47 L28 68 L42 68Z" fill="rgba(50,50,100,0.15)" stroke="currentColor" strokeWidth="1"/>
    {/* Bowed head */}
    <path d="M33 45 L32 50 M37 45 L38 50" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    {/* Three spilled cups */}
    {[22,32,42].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 72 L${x-3} 78 L${x+3} 78 L${x} 72Z`} fill="none" stroke="currentColor" strokeWidth="0.9" transform="rotate(180,${x},75)"/>
        <path d={`M${x-4} 72 Q${x} 68 ${x+4} 72`} fill="rgba(50,100,200,0.15)" stroke="rgba(100,150,255,0.4)" strokeWidth="0.8"/>
      </g>
    ))}
    {/* Two standing cups behind */}
    {[55,65].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 65 L${x-3} 72 L${x+3} 72 L${x} 65Z`} fill="none" stroke="currentColor" strokeWidth="0.9"/>
        <path d={`M${x-3} 72 L${x-2} 75 L${x+2} 75 L${x+3} 72`} fill="none" stroke="currentColor" strokeWidth="0.8"/>
      </g>
    ))}
    {/* Legs */}
    <path d="M30 68 L28 80 M40 68 L42 80" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </>,

  cups_6: <>
    <defs><linearGradient id="c6Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c6Bg)"/>
    {/* Village/garden background */}
    <rect x="50" y="55" width="20" height="25" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M48 55 L60 45 L72 55" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M5 65 L5 50 L10 50 L10 55 L15 55 L15 50 L20 50 L20 65" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Six cups with flowers */}
    {[[15,75],[30,75],[45,75],[15,90],[30,90],[45,90]].map(([x,y],i)=>(
      <g key={i}>
        <path d={`M${x} ${y-8} L${x-3} ${y-2} L${x+3} ${y-2} L${x} ${y-8}Z`} fill="none" stroke="currentColor" strokeWidth="0.8"/>
        <path d={`M${x-3} ${y-2} L${x-2} ${y+1} L${x+2} ${y+1} L${x+3} ${y-2}`} fill="none" stroke="currentColor" strokeWidth="0.7"/>
        {/* Flower in cup */}
        <circle cx={x} cy={y-9} r="2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.6"/>
        <circle cx={x} cy={y-9} r="0.8" fill="currentColor" opacity="0.3"/>
      </g>
    ))}
    {/* Older child giving cup to younger */}
    <circle cx="35" cy="45" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="33.5" cy="43.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <circle cx="36.5" cy="43.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <path d="M33.5 47 Q35 48.5 36.5 47" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    <path d="M35 49.5 L32 60 L38 60Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M33 53 L27 52 M37 53 L43 50" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Cup being offered */}
    <path d="M43 50 L40 56 L46 56 L43 50Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Smaller child */}
    <circle cx="55" cy="50" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M55 53.5 L53 62 L57 62Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M53 56 L49 54 M57 56 L61 54" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Guard walking away in background */}
    <circle cx="68" cy="58" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M68 61 L66 70 L70 70Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
  </>,

  cups_7: <>
    <defs><linearGradient id="c7Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c7Bg)"/>
    {/* Clouds with seven cups */}
    {/* Cup 1 - castle */}
    <path d="M8 25 L5 32 L15 32 L12 25Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M8 25 L8 18 L10 18 L10 22 L12 22 L12 18 L14 18 L14 25" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* Cup 2 - figure */}
    <path d="M22 20 L19 27 L29 27 L26 20Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="24" cy="17" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Cup 3 - wreath */}
    <path d="M36 18 L33 25 L43 25 L40 18Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="38" cy="14" r="4" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <circle cx="38" cy="14" r="2" fill="none" stroke="currentColor" strokeWidth="0.6"/>
    {/* Cup 4 - jewels */}
    <path d="M50 20 L47 27 L57 27 L54 20Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {[49,52,55].map((x,i)=>(
      <circle key={i} cx={x} cy={18} r="1" fill="currentColor" opacity="0.4"/>
    ))}
    {/* Cup 5 - dragon */}
    <path d="M64 22 L61 29 L71 29 L68 22Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M63 20 Q66 15 69 18 Q67 22 63 20Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Cup 6 - snake */}
    <path d="M5 38 L2 45 L12 45 L9 38Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M6 36 Q8 32 10 36 Q12 40 8 38" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Cup 7 - glowing orb */}
    <path d="M65 38 L62 45 L72 45 L69 38Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="67" cy="35" r="3" fill="rgba(255,200,50,0.15)" stroke="rgba(255,200,50,0.4)" strokeWidth="0.8"/>
    {/* Silhouette figure gazing up */}
    <circle cx="40" cy="70" r="5" fill="rgba(0,0,0,0.4)" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M40 75 L36 88 L44 88Z" fill="rgba(0,0,0,0.4)" stroke="currentColor" strokeWidth="1"/>
    <path d="M36 80 L30 76 M44 80 L50 76" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Clouds */}
    <path d="M0 30 Q15 24 25 30 Q30 24 40 28 Q50 22 60 28 Q68 22 75 28 Q80 24 80 32" fill="rgba(255,255,255,0.04)" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
  </>,

  cups_8: <>
    <defs><linearGradient id="c8Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c8Bg)"/>
    {/* Moon */}
    <circle cx="20" cy="18" r="8" fill="rgba(200,200,255,0.08)" stroke="currentColor" strokeWidth="1"/>
    <path d="M14 18 A8 8 0 0 1 26 18 A5 5 0 0 0 14 18Z" fill="rgba(200,200,255,0.05)"/>
    {/* Mountains */}
    <path d="M0 80 L20 55 L35 68 L50 50 L65 62 L80 52 L80 80Z" fill="rgba(80,80,100,0.15)" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* River */}
    <path d="M0 85 Q20 80 40 83 Q60 86 80 82 L80 95 Q60 92 40 95 Q20 98 0 95Z" fill="rgba(50,80,150,0.1)"/>
    {/* Eight cups stacked (incomplete) */}
    {[[15,75],[25,75],[35,75],[45,75],[55,75],[65,75],[20,65],[30,65]].map(([x,y],i)=>(
      <g key={i}>
        <path d={`M${x} ${y-7} L${x-3} ${y-1} L${x+3} ${y-1} L${x} ${y-7}Z`} fill="none" stroke="currentColor" strokeWidth="0.9"/>
        <path d={`M${x-3} ${y-1} L${x-2} ${y+2} L${x+2} ${y+2} L${x+3} ${y-1}`} fill="none" stroke="currentColor" strokeWidth="0.8"/>
      </g>
    ))}
    {/* Cloaked figure walking away */}
    <circle cx="55" cy="52" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {/* Hood */}
    <path d="M50 50 Q55 44 60 50" fill="rgba(50,50,100,0.2)" stroke="currentColor" strokeWidth="1"/>
    {/* Cloak */}
    <path d="M55 56.5 L50 70 L60 70Z" fill="rgba(50,50,100,0.15)" stroke="currentColor" strokeWidth="1"/>
    {/* Staff */}
    <path d="M58 58 L65 45" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    {/* Legs walking */}
    <path d="M52 70 L50 82 M58 70 L60 80" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </>,

  cups_9: <>
    <defs><linearGradient id="c9Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c9Bg)"/>
    {/* Nine cups on curved shelf */}
    <path d="M8 52 Q40 45 72 52" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {[10,18,26,34,42,50,58,66,74].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 52 L${x-3} 58 L${x+3} 58 L${x} 52Z`} fill="none" stroke="currentColor" strokeWidth="0.9"/>
        <path d={`M${x-3} 58 L${x-2} 61 L${x+2} 61 L${x+3} 58`} fill="none" stroke="currentColor" strokeWidth="0.8"/>
      </g>
    ))}
    {/* Satisfied merchant figure */}
    <circle cx="40" cy="72" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="70.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="70.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 74 Q40 75.5 41.5 74" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Rotund belly */}
    <path d="M40 77.5 Q32 80 30 88 Q38 92 40 90 Q42 92 50 88 Q48 80 40 77.5Z" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    {/* Arms folded contentedly */}
    <path d="M34 80 L28 78 Q30 84 34 83" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M46 80 L52 78 Q50 84 46 83" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Hat */}
    <path d="M34 68 Q40 62 46 68" fill="rgba(200,100,50,0.2)" stroke="currentColor" strokeWidth="1.1"/>
    {/* Legs */}
    <path d="M34 90 L32 100 M46 90 L48 100" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Stool */}
    <path d="M32 100 L48 100" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M34 100 L34 108 M46 100 L46 108" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </>,

  cups_10: <>
    <defs><linearGradient id="c10Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#c10Bg)"/>
    {/* Rainbow with 10 cups */}
    <path d="M5 55 Q40 15 75 55" fill="none" stroke="rgba(255,100,100,0.2)" strokeWidth="1.5"/>
    <path d="M8 58 Q40 20 72 58" fill="none" stroke="rgba(100,200,100,0.2)" strokeWidth="1.5"/>
    <path d="M11 61 Q40 25 69 61" fill="none" stroke="rgba(100,100,255,0.2)" strokeWidth="1.5"/>
    {/* Ten cups on rainbow */}
    {[12,22,32,40,48,56,64].map((x,i)=>{
      const t = (x-12)/52
      const y = 55 - 40*Math.sin(t*Math.PI) + 3
      return <g key={i}>
        <path d={`M${x} ${y} L${x-2} ${y+5} L${x+2} ${y+5} L${x} ${y}Z`} fill="none" stroke="currentColor" strokeWidth="0.8"/>
        <path d={`M${x-2} ${y+5} L${x-1.5} ${y+7} L${x+1.5} ${y+7} L${x+2} ${y+5}`} fill="none" stroke="currentColor" strokeWidth="0.7"/>
      </g>
    })}
    {/* Happy family */}
    {/* Parents */}
    <circle cx="28" cy="72" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M28 76.5 L25 88 L31 88Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M26 80 L20 77 M30 80 L36 77" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <circle cx="52" cy="72" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M52 76.5 L49 88 L55 88Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M50 80 L44 77 M54 80 L60 77" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Children dancing */}
    <circle cx="35" cy="82" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M35 85.5 L33 93 L37 93Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M33 88 L28 86 M37 88 L42 86" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="45" cy="82" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M45 85.5 L43 93 L47 93Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M43 88 L38 86 M47 88 L52 86" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* House */}
    <rect x="58" y="85" width="16" height="15" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M56 85 L66 75 L76 85" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    {/* Trees */}
    <path d="M8 100 L8 85" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    <circle cx="8" cy="82" r="5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
  </>,

  cups_page: <>
    <defs><linearGradient id="cPgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#cPgBg)"/>
    {/* Ocean background */}
    <path d="M0 75 Q20 70 40 73 Q60 76 80 72 L80 120 L0 120Z" fill="rgba(50,80,150,0.1)"/>
    <path d="M0 80 Q20 75 40 78 Q60 81 80 77" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3"/>
    {/* Figure */}
    <circle cx="40" cy="42" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Flowery hat */}
    <path d="M34 39 Q40 33 46 39" fill="rgba(100,150,200,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M36 37 Q40 32 44 37" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Tunic with fish pattern */}
    <path d="M40 47.5 L33 70 L47 70Z" fill="rgba(100,150,200,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 57 L46 57" stroke="currentColor" strokeWidth="0.8"/>
    {/* Fish pattern on tunic */}
    <path d="M37 60 Q40 57 43 60 Q40 63 37 60Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Arms */}
    <path d="M36 52 L26 56 M44 52 L54 56" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Cup with fish jumping out */}
    <path d="M22 54 L19 60 L25 60 L22 54Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M19 60 L20 63 L24 63 L25 60" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Fish */}
    <path d="M22 52 Q25 48 28 50 Q25 54 22 52Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <circle cx="26" cy="50" r="0.5" fill="currentColor" opacity="0.6"/>
    {/* Legs */}
    <path d="M35 70 L33 82 M45 70 L47 82" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  cups_knight: <>
    <defs><linearGradient id="cKnBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#cKnBg)"/>
    {/* River/stream */}
    <path d="M0 85 Q20 80 40 83 Q60 86 80 82 L80 100 Q60 96 40 99 Q20 102 0 98Z" fill="rgba(50,80,150,0.1)"/>
    {/* Trees */}
    <path d="M65 100 L65 78" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    <circle cx="65" cy="74" r="6" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Horse walking calmly */}
    <path d="M15 75 L20 65 L40 62 L58 65 L60 75 L52 82 L22 82Z" fill="rgba(200,200,220,0.06)" stroke="currentColor" strokeWidth="1"/>
    <path d="M58 65 L65 58 L70 62 L63 68Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="67" cy="57" r="1.5" fill="currentColor" opacity="0.6"/>
    <path d="M22 82 L20 92 M38 82 L36 92 M52 82 L50 92" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Knight */}
    <circle cx="38" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Winged helmet */}
    <path d="M33 45 Q38 39 43 45" fill="rgba(100,150,200,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M33 43 Q30 38 28 40 M43 43 Q46 38 48 40" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Armor */}
    <path d="M38 53 L34 65 L42 65Z" fill="rgba(150,150,200,0.1)" stroke="currentColor" strokeWidth="1"/>
    {/* Arms */}
    <path d="M34 56 L26 52 M42 56 L52 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Cup held forward */}
    <path d="M52 52 L55 58 L61 58 L58 52Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M55 58 L56 61 L60 61 L61 58" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Fish on helmet */}
    <path d="M35 43 Q38 40 41 43 Q38 46 35 43Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Legs */}
    <path d="M35 65 L33 75 M41 65 L43 75" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  cups_queen: <>
    <defs><linearGradient id="cQnBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#cQnBg)"/>
    {/* Ocean shore */}
    <path d="M0 85 Q20 80 40 83 Q60 86 80 82 L80 120 L0 120Z" fill="rgba(50,80,150,0.1)"/>
    <path d="M0 88 Q20 83 40 86 Q60 89 80 85" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3"/>
    {/* Throne of shells */}
    <rect x="22" y="55" width="36" height="45" rx="2" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
    <path d="M22 55 L22 45 L28 50 L40 42 L52 50 L58 45 L58 55" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    {/* Shell decorations */}
    {[24,36,48,56].map((x,i)=>(
      <path key={i} d={`M${x} 60 Q${x+3} 56 ${x+6} 60 Q${x+3} 64 ${x} 60Z`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    ))}
    {/* Queen figure */}
    <circle cx="40" cy="42" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M34 38 L36 32 L40 36 L44 32 L46 38" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M34 38 L46 38" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 47.5 L33 72 L47 72Z" fill="rgba(100,150,200,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 58 L46 58" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 52 L26 58 M44 52 L54 56" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Ornate cup */}
    <path d="M50 54 L47 62 L57 62 L54 54Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M47 62 L48 66 L56 66 L57 62" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M48 66 L50 70 L54 70 L56 66" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Angels on cup */}
    <path d="M49 58 Q51 55 53 58" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* Legs */}
    <path d="M35 72 L33 85 M45 72 L47 85" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  cups_king: <>
    <defs><linearGradient id="cKgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a1a" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a1a" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#cKgBg)"/>
    {/* Ocean with ship */}
    <path d="M0 80 Q20 75 40 78 Q60 81 80 77 L80 120 L0 120Z" fill="rgba(50,80,150,0.1)"/>
    <path d="M55 78 L58 70 L65 70 L68 78Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M61 70 L61 62" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M61 62 L67 65 L61 68Z" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
    {/* Fish jumping */}
    <path d="M12 78 Q15 72 20 75 Q17 80 12 78Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <circle cx="18" cy="73" r="0.5" fill="currentColor" opacity="0.5"/>
    {/* Throne on water */}
    <rect x="22" y="52" width="36" height="48" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M22 52 L22 42 L28 47 L40 39 L52 47 L58 42 L58 52" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* King figure */}
    <circle cx="40" cy="40" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="38.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="38.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 42 Q40 43.5 41.5 42" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M34 36 L36 30 L40 34 L44 30 L46 36" fill="rgba(200,150,50,0.2)" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M34 36 L46 36" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 45.5 L33 70 L47 70Z" fill="rgba(100,150,200,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M34 55 L46 55 M34 62 L46 62" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 50 L26 56 M44 50 L54 54" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Cup */}
    <path d="M50 52 L47 60 L57 60 L54 52Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M47 60 L48 64 L56 64 L57 60" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Scepter */}
    <path d="M26 56 L22 42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M19 40 L25 40 M22 37 L22 43" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Fish amulet */}
    <path d="M40 58 Q43 55 46 58 Q43 61 40 58Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Legs */}
    <path d="M35 70 L33 82 M45 70 L47 82" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  // ══════════════════════════════════════════════════════════════
  // MINOR ARCANA - SWORDS (Air, Conflict)
  // ══════════════════════════════════════════════════════════════

  swords_ace: <>
    <defs><linearGradient id="sAceBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#sAceBg)"/>
    {/* Storm clouds */}
    <path d="M5 30 Q15 24 25 28 Q32 20 42 26 Q52 18 62 24 Q70 20 75 28" fill="rgba(100,100,150,0.1)" stroke="currentColor" strokeWidth="0.7"/>
    {/* Hand from cloud */}
    <path d="M33 30 L36 22 L44 22 L47 30" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Sword pointing up */}
    <path d="M40 30 L40 90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Crossguard */}
    <path d="M28 50 L52 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    {/* Pommel */}
    <circle cx="40" cy="92" r="3" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {/* Crown on tip */}
    <path d="M34 28 L36 22 L40 26 L44 22 L46 28" fill="rgba(200,150,50,0.15)" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M34 28 L46 28" stroke="currentColor" strokeWidth="1"/>
    {/* Olive branch left */}
    <path d="M28 50 Q20 44 15 50 Q20 56 28 52" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {[16,20,24].map((x,i)=>(
      <ellipse key={i} cx={x} cy={50} rx="2" ry="1.2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    ))}
    {/* Palm branch right */}
    <path d="M52 50 Q60 44 65 50 Q60 56 52 52" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {[56,60,64].map((x,i)=>(
      <ellipse key={i} cx={x} cy={50} rx="2" ry="1.2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    ))}
    {/* Mountains */}
    <path d="M0 95 L15 75 L28 85 L40 70 L52 83 L65 73 L80 80 L80 95Z" fill="rgba(80,80,100,0.1)" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
  </>,

  swords_2: <>
    <defs><linearGradient id="s2Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s2Bg)"/>
    {/* Moon */}
    <circle cx="60" cy="18" r="7" fill="rgba(200,200,255,0.08)" stroke="currentColor" strokeWidth="1"/>
    {/* Sea with rocks */}
    <path d="M0 80 Q20 75 40 78 Q60 81 80 77 L80 100 Q60 96 40 99 Q20 102 0 98Z" fill="rgba(50,80,150,0.1)"/>
    <path d="M15 80 L18 72 L22 80Z M55 78 L58 70 L62 78Z M70 80 L72 74 L75 80Z" fill="rgba(100,100,120,0.2)" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Blindfolded figure */}
    <circle cx="40" cy="48" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Blindfold */}
    <path d="M34 47 L46 47" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M34 47 Q40 44 46 47" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Mouth */}
    <path d="M38 51 Q40 52.5 42 51" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Robe */}
    <path d="M40 53.5 L33 75 L47 75Z" fill="rgba(100,100,150,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 62 L46 62" stroke="currentColor" strokeWidth="0.8"/>
    {/* Two crossed swords */}
    <path d="M33 52 L15 35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M47 52 L65 35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    {/* Crossguards */}
    <path d="M20 40 L12 38 M20 40 L18 48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M60 40 L68 38 M60 40 L62 48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M35 75 L33 88 M45 75 L47 88" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Bench */}
    <path d="M28 88 L52 88" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M30 88 L30 95 M50 88 L50 95" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </>,

  swords_3: <>
    <defs><linearGradient id="s3Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s3Bg)"/>
    {/* Storm clouds */}
    <path d="M0 20 Q15 12 30 18 Q38 10 50 16 Q62 8 75 16 Q80 12 80 22 Q65 28 50 22 Q38 28 25 22 Q12 28 0 22Z" fill="rgba(80,80,120,0.15)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Rain */}
    {[10,20,30,40,50,60,70].map((x,i)=>(
      <path key={i} d={`M${x} 28 L${x-2} 40`} stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.3"/>
    ))}
    {/* Heart */}
    <path d="M40 50 Q40 42 32 42 Q24 42 24 50 Q24 58 40 68 Q56 58 56 50 Q56 42 48 42 Q40 42 40 50Z" fill="rgba(200,50,50,0.15)" stroke="currentColor" strokeWidth="1.3"/>
    {/* Three swords piercing heart */}
    <path d="M40 30 L40 72" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38 34 L42 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 35 L52 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 38 L26 33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M58 35 L28 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M60 38 L54 33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Drops falling */}
    {[35,40,45,30,50].map((x,i)=>(
      <path key={i} d={`M${x} 70 Q${x} 75 ${x-1} 78`} fill="none" stroke="rgba(200,50,50,0.3)" strokeWidth="1" strokeLinecap="round"/>
    ))}
  </>,

  swords_4: <>
    <defs><linearGradient id="s4Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s4Bg)"/>
    {/* Church window */}
    <path d="M25 15 L25 55 Q40 45 55 55 L55 15 Q40 8 25 15Z" fill="rgba(100,100,200,0.08)" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M32 15 Q40 10 48 15" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M32 25 Q40 20 48 25 M32 35 Q40 30 48 35 M32 45 Q40 40 48 45" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    {/* Tomb/sarcophagus */}
    <rect x="10" y="65" width="60" height="20" rx="3" fill="rgba(100,100,150,0.1)" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M10 65 Q40 58 70 65" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Effigy on tomb */}
    <circle cx="40" cy="62" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="38.5" cy="60.5" r="0.6" fill="currentColor" opacity="0.6"/>
    <circle cx="41.5" cy="60.5" r="0.6" fill="currentColor" opacity="0.6"/>
    <path d="M38.5 63 Q40 64 41.5 63" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Hands in prayer */}
    <path d="M36 66 L38 72 L42 72 L44 66" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M38 66 L38 72 M40 66 L40 72 M42 66 L42 72" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    {/* Three swords on wall */}
    <path d="M20 30 L20 60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 35 L23 35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M30 28 L30 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M27 33 L33 33" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M50 28 L50 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M47 33 L53 33" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* One sword on tomb */}
    <path d="M15 68 L65 68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M38 66 L42 66" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </>,

  swords_5: <>
    <defs><linearGradient id="s5Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s5Bg)"/>
    {/* Stormy sky */}
    <path d="M0 0 Q20 15 40 10 Q60 5 80 15 L80 45 Q60 35 40 40 Q20 45 0 35Z" fill="rgba(50,50,100,0.15)"/>
    {/* Sea */}
    <path d="M0 80 Q20 75 40 78 Q60 81 80 77 L80 100 Q60 96 40 99 Q20 102 0 98Z" fill="rgba(50,80,150,0.1)"/>
    {/* Victorious figure with 5 swords */}
    <circle cx="35" cy="45" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="33.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="36.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M33.5 47 Q35 48.5 36.5 47" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Smirking expression */}
    <path d="M33.5 47 Q35 49 36.5 47" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    <path d="M35 50 L32 62 L38 62Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M33 54 L27 52 M37 54 L43 52" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Three swords held/gathered */}
    <path d="M27 52 L22 35 M27 52 L25 35 M27 52 L30 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Two swords on ground */}
    <path d="M45 70 L65 60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M45 75 L65 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Two defeated figures walking away */}
    <circle cx="58" cy="55" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
    <path d="M58 58.5 L56 68 L60 68Z" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.6"/>
    <circle cx="68" cy="58" r="3" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
    <path d="M68 61 L66 70 L70 70Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    {/* Legs */}
    <path d="M33 62 L31 75 M37 62 L39 75" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  swords_6: <>
    <defs><linearGradient id="s6Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s6Bg)"/>
    {/* Water - rough left, calm right */}
    <path d="M0 70 Q10 65 20 70 Q25 65 30 70 L30 100 Q20 95 10 100 Q5 95 0 100Z" fill="rgba(50,80,150,0.15)"/>
    <path d="M30 72 Q50 68 70 72 Q75 68 80 72 L80 100 Q70 97 50 100 Q35 97 30 100Z" fill="rgba(50,80,150,0.08)"/>
    {/* Boat */}
    <path d="M20 72 Q40 68 60 72 L55 85 L25 85Z" fill="rgba(100,80,50,0.15)" stroke="currentColor" strokeWidth="1.2"/>
    {/* Six swords in boat */}
    {[28,34,40,46,52,58].map((x,i)=>(
      <path key={i} d={`M${x} 72 L${x} 58`} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    ))}
    {/* Ferryman */}
    <circle cx="55" cy="62" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M55 66 L53 75 L57 75Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Oar */}
    <path d="M57 64 L65 55" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M63 53 L68 58 L65 60 L60 55Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Cloaked passenger with child */}
    <circle cx="32" cy="64" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M28 62 Q32 58 36 62" fill="rgba(80,80,120,0.2)" stroke="currentColor" strokeWidth="1"/>
    <path d="M32 68 L30 76 L34 76Z" fill="rgba(80,80,120,0.15)" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="28" cy="70" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M28 72.5 L27 78 L29 78Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Distant shore */}
    <path d="M60 85 Q70 80 80 82 L80 90 Q70 88 60 90Z" fill="rgba(50,80,30,0.1)" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
  </>,

  swords_7: <>
    <defs><linearGradient id="s7Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s7Bg)"/>
    {/* Military camp */}
    <path d="M40 55 L50 45 L60 55" fill="rgba(200,100,50,0.1)" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M50 55 L50 75" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    <path d="M40 55 L60 55" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    {/* Tent */}
    <path d="M62 50 L70 42 L78 50" fill="rgba(200,100,50,0.08)" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M62 50 L78 50 L78 65 L62 65Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Sneaking figure */}
    <circle cx="30" cy="52" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="28.5" cy="50.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="31.5" cy="50.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M28.5 54 Q30 55 31
.5 54" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <path d="M30 57 L27 68 L33 68Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M28 61 L22 58 M32 61 L38 58" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Five swords carried */}
    <path d="M22 58 L18 42 M22 58 L20 42 M22 58 L24 42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    {/* Two swords left behind */}
    <path d="M50 65 L55 50" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M56 65 L61 50" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    {/* Soldiers in background noticing */}
    <circle cx="65" cy="60" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <path d="M65 63 L63 72 L67 72Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Legs sneaking */}
    <path d="M28 68 L26 80 M32 68 L34 78" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  swords_8: <>
    <defs><linearGradient id="s8Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s8Bg)"/>
    {/* Castle in background */}
    <rect x="50" y="45" width="20" height="30" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M50 45 L50 38 L55 41 L60 36 L65 41 L70 38 L70 45" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Muddy ground */}
    <path d="M0 88 Q40 82 80 88 L80 120 L0 120Z" fill="rgba(80,60,40,0.1)"/>
    {/* Bound, blindfolded figure */}
    <circle cx="30" cy="52" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Blindfold */}
    <path d="M24 51 L36 51" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M24 51 Q30 48 36 51" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Bound body */}
    <path d="M30 57 L28 72 L32 72Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Rope bindings */}
    <path d="M26 60 Q30 58 34 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M26 64 Q30 62 34 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M26 68 Q30 66 34 68" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Arms bound behind */}
    <path d="M28 60 L22 58 L24 66 L28 64" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M32 60 L38 58 L36 66 L32 64" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Eight swords surrounding */}
    {[10,18,42,50,58,66].map((x,i)=>(
      <path key={i} d={`M${x} 30 L${x} 80`} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    ))}
    <path d="M5 40 L75 40" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
    <path d="M5 70 L75 70" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
    {/* Legs */}
    <path d="M28 72 L26 85 M32 72 L34 85" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  swords_9: <>
    <defs><linearGradient id="s9Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s9Bg)"/>
    {/* Nine swords on wall */}
    {[15,22,29,36,43,50,57,64,71].map((x,i)=>(
      <path key={i} d={`M${x} 15 L${x} 55`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    ))}
    {/* Crossguards on swords */}
    {[15,22,29,36,43,50,57,64,71].map((x,i)=>(
      <path key={i} d={`M${x-3} 20 L${x+3} 20`} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    ))}
    {/* Bed */}
    <rect x="10" y="70" width="60" height="20" rx="2" fill="rgba(100,80,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M10 70 L10 65 L70 65 L70 70" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Quilt pattern */}
    <path d="M15 75 L25 75 M35 75 L45 75 M55 75 L65 75 M15 80 L25 80 M35 80 L45 80 M55 80 L65 80" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
    {/* Figure sitting up in bed, hands on face */}
    <circle cx="40" cy="60" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="58.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="58.5" r="0.7" fill="currentColor" opacity="0.8"/>
    {/* Hands covering face in anguish */}
    <path d="M35 62 L30 58 Q32 54 36 56 L38 62" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M45 62 L50 58 Q48 54 44 56 L42 62" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Nightgown */}
    <path d="M40 65 L36 78 L44 78Z" fill="rgba(200,200,220,0.08)" stroke="currentColor" strokeWidth="1"/>
    {/* Roses on quilt */}
    {[20,35,50,65].map((x,i)=>(
      <circle key={i} cx={x} cy={78} r="2" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
    ))}
  </>,

  swords_10: <>
    <defs><linearGradient id="s10Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#s10Bg)"/>
    {/* Dark sky with one ray of light */}
    <path d="M0 0 Q20 20 40 15 Q60 10 80 25 L80 55 Q60 45 40 50 Q20 55 0 45Z" fill="rgba(20,20,50,0.3)"/>
    <path d="M55 0 Q65 20 70 40" fill="none" stroke="rgba(255,200,100,0.15)" strokeWidth="8" strokeLinecap="round"/>
    {/* Calm sea */}
    <path d="M0 75 Q20 70 40 73 Q60 76 80 72 L80 100 Q60 96 40 99 Q20 102 0 98Z" fill="rgba(50,80,150,0.1)"/>
    {/* Prone figure with 10 swords */}
    <circle cx="35" cy="68" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M35 72.5 L20 80 L50 80Z" fill="rgba(50,50,100,0.1)" stroke="currentColor" strokeWidth="1"/>
    {/* Arms spread */}
    <path d="M25 75 L15 72 M45 75 L55 72" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Ten swords in back */}
    {[22,26,30,34,38,42,46,50,54,58].map((x,i)=>(
      <path key={i} d={`M${x} ${68+i*1.2} L${x+2} ${48+i*0.8}`} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    ))}
    {/* Mountains silhouette */}
    <path d="M0 72 L12 58 L22 65 L35 52 L48 62 L60 55 L72 62 L80 58 L80 72Z" fill="rgba(30,30,60,0.2)" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
  </>,

  swords_page: <>
    <defs><linearGradient id="sPgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#sPgBg)"/>
    {/* Windy sky with birds */}
    <path d="M0 0 Q20 15 40 10 Q60 5 80 15 L80 40 Q60 30 40 35 Q20 40 0 30Z" fill="rgba(80,80,150,0.1)"/>
    {[15,30,55,70].map((x,i)=>(
      <path key={i} d={`M${x} ${15+i*3} Q${x+4} ${12+i*3} ${x+8} ${15+i*3}`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    ))}
    {/* Windy clouds */}
    <path d="M0 25 Q15 20 25 25 Q30 18 40 22 Q50 16 60 22 Q70 18 80 24" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3"/>
    {/* Figure on hilltop */}
    <circle cx="40" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 50 Q40 51.5 41.5 50" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Wind-blown hair */}
    <path d="M36 45 Q32 40 30 42 M40 44 Q38 38 36 40 M44 45 Q48 40 50 42" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    {/* Tunic */}
    <path d="M40 53 L36 66 L44 66Z" fill="rgba(100,100,150,0.1)" stroke="currentColor" strokeWidth="1"/>
    {/* Arms */}
    <path d="M37 56 L28 52 M43 56 L52 50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Sword raised high */}
    <path d="M52 50 L58 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M55 35 L62 33" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="58" cy="26" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Legs */}
    <path d="M37 66 L35 78 M43 66 L45 78" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Hilltop */}
    <path d="M0 85 Q20 78 40 82 Q60 86 80 80 L80 120 L0 120Z" fill="rgba(80,80,100,0.1)"/>
  </>,

  swords_knight: <>
    <defs><linearGradient id="sKnBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#sKnBg)"/>
    {/* Storm sky */}
    <path d="M0 0 Q20 18 40 12 Q60 6 80 18 L80 50 Q60 40 40 45 Q20 50 0 40Z" fill="rgba(50,50,100,0.2)"/>
    {/* Wind-blown trees */}
    <path d="M62 100 L62 78" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    <path d="M62 78 Q68 70 72 75 Q68 80 62 78" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M62 78 Q55 72 52 77 Q56 82 62 78" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    {/* Horse charging at full gallop */}
    <path d="M8 72 L15 58 L38 55 L62 58 L65 68 L58 78 L18 78Z" fill="rgba(200,200,220,0.06)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M62 58 L70 48 L76 52 L68 62Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="73" cy="47" r="1.5" fill="currentColor" opacity="0.6"/>
    {/* Hooves */}
    <path d="M18 78 L15 88 M30 78 L28 88 M45 78 L43 88 M58 78 L56 88" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Knight */}
    <circle cx="38" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Helmet */}
    <path d="M33 39 Q38 33 43 39" fill="rgba(150,150,200,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M33 42 L30 42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Armor */}
    <path d="M38 47 L34 60 L42 60Z" fill="rgba(150,150,200,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M35 52 L41 52" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms charging */}
    <path d="M34 50 L25 46 M42 50 L52 44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Sword thrust forward */}
    <path d="M52 44 L72 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M58 40 L65 38" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="72" cy="28" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Legs */}
    <path d="M35 60 L33 70 M41 60 L43 70" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  swords_queen: <>
    <defs><linearGradient id="sQnBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#sQnBg)"/>
    {/* Cloudy sky */}
    <path d="M0 0 Q20 18 40 12 Q60 6 80 18 L80 45 Q60 35 40 40 Q20 45 0 35Z" fill="rgba(80,80,120,0.15)"/>
    {/* Birds */}
    {[20,40,60,75].map((x,i)=>(
      <path key={i} d={`M${x} ${12+i*2} Q${x+4} ${9+i*2} ${x+8} ${12+i*2}`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    ))}
    {/* Throne */}
    <rect x="22" y="52" width="36" height="50" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M22 52 L22 42 L28 47 L40 39 L52 47 L58 42 L58 52" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Butterfly on throne */}
    <path d="M38 48 Q36 44 34 46 Q36 50 38 48Z M42 48 Q44 44 46 46 Q44 50 42 48Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Queen */}
    <circle cx="40" cy="40" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="38.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="38.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 42 Q40 43.5 41.5 42" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M34 36 L36 30 L40 34 L44 30 L46 36" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M34 36 L46 36" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 45.5 L33 70 L47 70Z" fill="rgba(100,100,150,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 55 L46 55 M34 62 L46 62" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 50 L26 56 M44 50 L54 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Sword raised */}
    <path d="M54 52 L60 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M57 40 L64 38" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="60" cy="26" r="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Left hand beckoning */}
    <path d="M26 56 L20 52 L22 48 L26 52" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Legs */}
    <path d="M35 70 L33 82 M45 70 L47 82" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  swords_king: <>
    <defs><linearGradient id="sKgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1e" stopOpacity="0.95"/><stop offset="100%" stopColor="#050510" stopOpacity="0.98"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#sKgBg)"/>
    {/* Stormy sky */}
    <path d="M0 0 Q20 20 40 14 Q60 8 80 20 L80 50 Q60 40 40 46 Q20 52 0 42Z" fill="rgba(50,50,100,0.2)"/>
    {/* Throne with butterflies and sylphs */}
    <rect x="20" y="50" width="40" height="55" rx="2" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M20 50 L20 40 L26 45 L40 37 L54 45 L60 40 L60 50" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Butterfly decorations */}
    {[24,54].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 55 Q${x-3} 51 ${x-5} 53 Q${x-3} 57 ${x} 55Z`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
        <path d={`M${x} 55 Q${x+3} 51 ${x+5} 53 Q${x+3} 57 ${x} 55Z`} fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
      </g>
    ))}
    {/* King */}
    <circle cx="40" cy="38" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 40 Q40 41.5 41.5 40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M34 34 L36 28 L40 32 L44 28 L46 34" fill="rgba(200,150,50,0.2)" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M34 34 L46 34" stroke="currentColor" strokeWidth="1"/>
    {/* Robe */}
    <path d="M40 43.5 L33 68 L47 68Z" fill="rgba(100,100,150,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M34 53 L46 53 M34 60 L46 60" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 48 L26 54 M44 48 L54 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Sword upright */}
    <path d="M54 52 L58 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M55 40 L62 38" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="58" cy="26" r="3" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M55 26 L61 26 M58 23 L58 29" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
    {/* Orb */}
    <circle cx="26" cy="54" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M26 50 L26 58 M22 54 L30 54" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M35 68 L33 80 M45 68 L47 80" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  // ══════════════════════════════════════════════════════════════
  // MINOR ARCANA - PENTACLES (Earth, Material)
  // ══════════════════════════════════════════════════════════════

  pentacles_ace: <>
    <defs><linearGradient id="pAceBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#pAceBg)"/>
    {/* Garden arch */}
    <path d="M10 120 L10 75 Q10 55 25 50 Q40 45 55 50 Q70 55 70 75 L70 120" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    {/* Clouds */}
    <path d="M10 28 Q20 22 30 26 Q38 20 48 24 Q58 18 68 24 Q75 20 78 28" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="0.7"/>
    {/* Hand from cloud */}
    <path d="M33 28 L36 20 L44 20 L47 28" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Large pentacle */}
    <circle cx="40" cy="52" r="18" fill="rgba(200,150,50,0.08)" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="40" cy="52" r="14" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Star inside */}
    {[0,72,144,216,288].map((a,i)=>{
      const r1=14, r2=6
      const x1=40+r1*Math.sin(a*Math.PI/180), y1=52-r1*Math.cos(a*Math.PI/180)
      const x2=40+r2*Math.sin((a+36)*Math.PI/180), y2=52-r2*Math.cos((a+36)*Math.PI/180)
      return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.9"/>
    })}
    {/* Garden below */}
    <path d="M0 90 Q20 85 40 88 Q60 91 80 87 L80 120 L0 120Z" fill="rgba(50,80,30,0.15)"/>
    {/* Flowers */}
    {[12,25,38,52,65].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 90 L${x} 82`} stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
        <circle cx={x} cy={80} r="2.5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
        <circle cx={x} cy={80} r="1" fill="currentColor" opacity="0.3"/>
      </g>
    ))}
    {/* Mountains far away */}
    <path d="M0 88 L10 78 L20 83 L30 75 L40 80 L50 74 L60 79 L70 73 L80 78 L80 88Z" fill="rgba(80,100,50,0.08)" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
  </>,

  pentacles_2: <>
    <defs><linearGradient id="p2Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p2Bg)"/>
    {/* Ships on wavy sea */}
    <path d="M0 85 Q10 80 20 85 Q30 80 40 85 Q50 80 60 85 Q70 80 80 85 L80 100 Q70 95 60 100 Q50 95 40 100 Q30 95 20 100 Q10 95 0 100Z" fill="rgba(50,80,150,0.1)"/>
    <path d="M10 85 L12 78 L18 78 L20 85Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M14 78 L14 70" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M14 70 L20 73 L14 76Z" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
    <path d="M55 83 L57 76 L63 76 L65 83Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M60 76 L60 68" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M60 68 L66 71 L60 74Z" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
    {/* Juggler figure */}
    <circle cx="40" cy="45" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="43.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 47 Q40 48.5 41.5 47" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Jester hat */}
    <path d="M34 41 Q40 35 46 41" fill="rgba(200,100,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M34 39 L30 32 M46 39 L50 32" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="30" cy="31" r="1.5" fill="currentColor" opacity="0.4"/>
    <circle cx="50" cy="31" r="1.5" fill="currentColor" opacity="0.4"/>
    {/* Body */}
    <path d="M40 50.5 L36 65 L44 65Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    {/* Arms juggling */}
    <path d="M37 54 L25 48 M43 54 L55 48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Infinity symbol connecting two pentacles */}
    <path d="M25 48 Q20 42 25 36 Q30 30 35 36 Q40 42 45 36 Q50 30 55 36 Q60 42 55 48" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {/* Two pentacles */}
    <circle cx="25" cy="42" r="6" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    <circle cx="55" cy="42" r="6" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    {/* Stars */}
    {[25,55].map((cx,i)=>(
      <g key={i}>
        {[0,72,144,216,288].map((a,j)=>{
          const r1=5, r2=2.2
          const x1=cx+r1*Math.sin(a*Math.PI/180), y1=42-r1*Math.cos(a*Math.PI/180)
          const x2=cx+r2*Math.sin((a+36)*Math.PI/180), y2=42-r2*Math.cos((a+36)*Math.PI/180)
          return <path key={j} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.7"/>
        })}
      </g>
    ))}
    {/* Legs */}
    <path d="M37 65 L35 78 M43 65 L45 78" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  pentacles_3: <>
    <defs><linearGradient id="p3Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p3Bg)"/>
    {/* Cathedral arch */}
    <path d="M15 120 L15 55 Q15 30 40 25 Q65 30 65 55 L65 120" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M15 55 Q15 30 40 25 Q65 30 65 55" fill="rgba(100,80,50,0.08)"/>
    {/* Three pentacles in arch */}
    {[25,40,55].map((x,i)=>(
      <g key={i}>
        <circle cx={x} cy={40+i*8} r="5" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.9"/>
        {[0,72,144,216,288].map((a,j)=>{
          const r1=4, r2=1.8
          const x1=x+r1*Math.sin(a*Math.PI/180), y1=40+i*8-r1*Math.cos(a*Math.PI/180)
          const x2=x+r2*Math.sin((a+36)*Math.PI/180), y2=40+i*8-r2*Math.cos((a+36)*Math.PI/180)
          return <path key={j} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.6"/>
        })}
      </g>
    ))}
    {/* Craftsman on scaffold */}
    <path d="M10 75 L70 75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M15 75 L15 90 M65 75 L65 90" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="40" cy="68" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M40 72.5 L37 80 L43 80Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M38 75 L32 72 M42 75 L48 72" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Chisel/tools */}
    <path d="M48 72 L52 65" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M50 64 L54 68 L52 70 L48 66Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Two observers with plans */}
    <circle cx="20" cy="82" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M20 85.5 L18 93 L22 93Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="60" cy="82" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M60 85.5 L58 93 L62 93Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Scroll/plans */}
    <rect x="14" y="87" width="10" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    <path d="M16 89 L22 89 M16 91 L22 91" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
    {/* Legs */}
    <path d="M38 80 L36 90 M42 80 L44 90" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </>,

  pentacles_4: <>
    <defs><linearGradient id="p4Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p4Bg)"/>
    {/* City in background */}
    <rect x="45" y="60" width="8" height="20" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M45 60 L49 52 L53 60" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <rect x="55" y="65" width="6" height="15" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <rect x="63" y="62" width="10" height="18" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Miser figure */}
    <circle cx="30" cy="48" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="28.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="31.5" cy="46.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M28.5 50 Q30 51 31.5 50" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown on head */}
    <path d="M24 44 L26 38 L30 42 L34 38 L36 44" fill="rgba(200,150,50,0.15)" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    <path d="M24 44 L36 44" stroke="currentColor" strokeWidth="0.9"/>
    {/* Pentacle on crown */}
    <circle cx="30" cy="42" r="3" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* Body */}
    <path d="M30 53.5 L26 70 L34 70Z" fill="rgba(200,150,50,0.08)" stroke="currentColor" strokeWidth="1"/>
    {/* Arms clutching pentacles */}
    <path d="M27 57 L18 53 M33 57 L42 53" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Pentacle in arms */}
    <circle cx="18" cy="52" r="5" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="42" cy="52" r="5" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Pentacle under feet */}
    <circle cx="30" cy="75" r="5" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Legs */}
    <path d="M27 70 L25 80 M33 70 L35 80" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Feet on pentacle */}
    <path d="M25 80 L27 82 L33 82 L35 80" fill="none" stroke="currentColor" strokeWidth="0.9"/>
  </>,

  pentacles_5: <>
    <defs><linearGradient id="p5Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p5Bg)"/>
    {/* Church window with five pentacles */}
    <path d="M25 15 L25 60 Q40 50 55 60 L55 15 Q40 8 25 15Z" fill="rgba(100,80,50,0.08)" stroke="currentColor" strokeWidth="0.9"/>
    {/* Five pentacles in window */}
    {[[40,22],[30,32],[50,32],[33,44],[47,44]].map(([x,y],i)=>(
      <g key={i}>
        <circle cx={x} cy={y} r="4" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.8"/>
        {[0,72,144,216,288].map((a,j)=>{
          const r1=3.2, r2=1.4
          const x1=x+r1*Math.sin(a*Math.PI/180), y1=y-r1*Math.cos(a*Math.PI/180)
          const x2=x+r2*Math.sin((a+36)*Math.PI/180), y2=y-r2*Math.cos((a+36)*Math.PI/180)
          return <path key={j} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.6"/>
        })}
      </g>
    ))}
    {/* Snow on ground */}
    <path d="M0 90 Q20 85 40 88 Q60 91 80 87 L80 120 L0 120Z" fill="rgba(200,220,255,0.08)"/>
    {/* Two beggars in snow */}
    <circle cx="22" cy="68" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {/* Bandaged foot */}
    <path d="M22 72.5 L18 82 L26 82Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M18 78 L14 76 M26 78 L30 76" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Crutch */}
    <path d="M14 76 L10 62" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M8 62 L12 62" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Bandage */}
    <path d="M18 80 Q22 78 26 80" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Second figure */}
    <circle cx="52" cy="65" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    {/* Cloak */}
    <path d="M48 63 Q52 57 56 63" fill="rgba(80,80,100,0.15)" stroke="currentColor" strokeWidth="1"/>
    <path d="M52 69.5 L48 80 L56 80Z" fill="rgba(80,80,100,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M50 73 L44 70 M54 73 L60 70" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M20 82 L18 92 M24 82 L26 92" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M50 80 L48 90 M54 80 L56 90" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </>,

  pentacles_6: <>
    <defs><linearGradient id="p6Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p6Bg)"/>
    {/* Merchant figure */}
    <circle cx="40" cy="38" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 40 Q40 41.5 41.5 40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Turban */}
    <path d="M34 35 Q40 29 46 35" fill="rgba(200,100,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M36 33 Q40 28 44 33" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Robe */}
    <path d="M40 43.5 L33 68 L47 68Z" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 53 L46 53 M34 60 L46 60" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 48 L24 52 M44 48 L56 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Scales of justice */}
    <path d="M40 25 L40 38" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M30 25 L50 25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M30 25 L26 32 L34 32Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M50 25 L46 32 L54 32Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Six pentacles being given */}
    {[[20,55],[20,62],[20,69],[58,55],[58,62],[58,69]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="3" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.7"/>
    ))}
    {/* Two kneeling beggars */}
    <circle cx="18" cy="75" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M18 78.5 L15 85 L21 85Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M16 81 L12 79 M20 81 L24 79" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <circle cx="62" cy="75" r="3.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M62 78.5 L59 85 L65 85Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M60 81 L56 79 M64 81 L68 79" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M35 68 L33 80 M45 68 L47 80" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  pentacles_7: <>
    <defs><linearGradient id="p7Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p7Bg)"/>
    {/* Lush vine/bush */}
    <path d="M30 120 L30 70 Q28 55 35 48 Q42 42 50 48 Q58 55 56 70 L56 120" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
    <path d="M30 80 Q20 72 15 78 Q20 85 30 82" fill="rgba(50,80,30,0.15)" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M30 68 Q22 62 18 68 Q22 74 30 70" fill="rgba(50,80,30,0.15)" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M56 75 Q65 68 70 74 Q65 80 56 77" fill="rgba(50,80,30,0.15)" stroke="currentColor" strokeWidth="0.8"/>
    {/* Seven pentacles on vine */}
    {[[25,55],[35,45],[50,42],[58,55],[22,68],[45,65],[55,75]].map(([x,y],i)=>(
      <g key={i}>
        <circle cx={x} cy={y} r="4" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.8"/>
        {[0,72,144,216,288].map((a,j)=>{
          const r1=3.2, r2=1.4
          const x1=x+r1*Math.sin(a*Math.PI/180), y1=y-r1*Math.cos(a*Math.PI/180)
          const x2=x+r2*Math.sin((a+36)*Math.PI/180), y2=y-r2*Math.cos((a+36)*Math.PI/180)
          return <path key={j} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.6"/>
        })}
      </g>
    ))}
    {/* Farmer leaning on hoe */}
    <circle cx="20" cy="52" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="18.5" cy="50.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <circle cx="21.5" cy="50.5" r="0.6" fill="currentColor" opacity="0.8"/>
    <path d="M18.5 54 Q20 55.5 21.5 54" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    <path d="M20 56.5 L17 68 L23 68Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M18 60 L12 57 M22 60 L28 57" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Hoe */}
    <path d="M28 57 L28 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 30 L32 30 L32 35 L24 35Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Legs */}
    <path d="M18 68 L16 80 M22 68 L24 80" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Ground */}
    <path d="M0 85 Q40 80 80 85 L80 120 L0 120Z" fill="rgba(80,60,30,0.1)"/>
  </>,

  pentacles_8: <>
    <defs><linearGradient id="p8Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p8Bg)"/>
    {/* City in background */}
    <rect x="55" y="55" width="18" height="30" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M55 55 L64 45 L73 55" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Workbench */}
    <rect x="35" y="60" width="30" height="5" rx="1" fill="rgba(100,80,50,0.15)" stroke="currentColor" strokeWidth="1"/>
    <path d="M38 65 L38 80 M62 65 L62 80" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Craftsman */}
    <circle cx="28" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="26.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="29.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M26.5 44 Q28 45.5 29.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Tunic */}
    <path d="M28 47 L24 60 L32 60Z" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M25 52 L31 52" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms working */}
    <path d="M25 52 L18 50 M31 52 L38 50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Hammer/chisel */}
    <path d="M38 50 L42 45" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M40 43 L44 47 L42 49 L38 45Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Eight pentacles on post */}
    <path d="M8 15 L8 110" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {[20,32,44,56,68,80,92,104].map((y,i)=>(
      <g key={i}>
        <circle cx={8} cy={y} r="5" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.8"/>
        {[0,72,144,216,288].map((a,j)=>{
          const r1=4, r2=1.8
          const x1=8+r1*Math.sin(a*Math.PI/180), y1=y-r1*Math.cos(a*Math.PI/180)
          const x2=8+r2*Math.sin((a+36)*Math.PI/180), y2=y-r2*Math.cos((a+36)*Math.PI/180)
          return <path key={j} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.6"/>
        })}
      </g>
    ))}
    {/* Legs */}
    <path d="M25 60 L23 72 M31 60 L33 72" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Stool */}
    <path d="M20 72 L36 72" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M22 72 L22 80 M34 72 L34 80" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </>,

  pentacles_9: <>
    <defs><linearGradient id="p9Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p9Bg)"/>
    {/* Lush garden */}
    <path d="M0 80 Q20 75 40 78 Q60 81 80 77 L80 120 L0 120Z" fill="rgba(50,80,30,0.15)"/>
    {/* Grapevines */}
    <path d="M10 120 L10 60 Q12 45 20 40 Q28 35 35 42" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
    <path d="M70 120 L70 60 Q68 45 60 40 Q52 35 45 42" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
    {/* Grapes */}
    {[[15,55],[18,62],[12,62],[22,68],[8,68],[15,70]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="2" fill="rgba(100,50,150,0.2)" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    ))}
    {[[65,55],[62,62],[68,62],[58,68],[72,68],[65,70]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="2" fill="rgba(100,50,150,0.2)" stroke="currentColor" strokeWidth="0.6" opacity="0.5"/>
    ))}
    {/* Elegant woman */}
    <circle cx="40" cy="42" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Elaborate headdress */}
    <path d="M34 39 Q40 33 46 39" fill="rgba(200,150,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M36 37 Q40 31 44 37" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Gown */}
    <path d="M40 47.5 L32 72 L48 72Z" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M33 57 L47 57 M33 63 L47 63" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 52 L26 58 M44 52 L54 56" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Falcon on glove */}
    <path d="M22 56 L18 50 Q20 46 24 48 L26 54" fill="rgba(100,80,50,0.15)" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="18" cy="48" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M17 46 Q18 43 19 46" fill="none" stroke="currentColor" strokeWidth="0.7"/>
    {/* Nine pentacles on vines */}
    {[[25,52],[35,45],[50,42],[58,50],[22,65],[45,62],[55,70],[30,72],[48,75]].map(([x,y],i)=>(
      <g key={i}>
        <circle cx={x} cy={y} r="3.5" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.7"/>
        {[0,72,144,216,288].map((a,j)=>{
          const r1=2.8, r2=1.2
          const x1=x+r1*Math.sin(a*Math.PI/180), y1=y-r1*Math.cos(a*Math.PI/180)
          const x2=x+r2*Math.sin((a+36)*Math.PI/180), y2=y-r2*Math.cos((a+36)*Math.PI/180)
          return <path key={j} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.5"/>
        })}
      </g>
    ))}
    {/* Snail at feet */}
    <path d="M35 76 Q38 73 42 76 Q38 79 35 76Z" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <circle cx="36" cy="75" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
    {/* Legs */}
    <path d="M34 72 L32 84 M46 72 L48 84" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  pentacles_10: <>
    <defs><linearGradient id="p10Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#p10Bg)"/>
    {/* Grand estate arch */}
    <path d="M8 120 L8 60 Q8 35 40 28 Q72 35 72 60 L72 120" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
    <path d="M8 60 Q8 35 40 28 Q72 35 72 60" fill="rgba(100,80,50,0.06)"/>
    {/* Ten pentacles in Tree of Life pattern */}
    {[[40,32],[28,42],[52,42],[20,55],[40,55],[60,55],[28,68],[52,68],[32,80],[48,80]].map(([x,y],i)=>(
      <g key={i}>
        <circle cx={x} cy={y} r="4" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="0.8"/>
        {[0,72,144,216,288].map((a,j)=>{
          const r1=3.2, r2=1.4
          const x1=x+r1*Math.sin(a*Math.PI/180), y1=y-r1*Math.cos(a*Math.PI/180)
          const x2=x+r2*Math.sin((a+36)*Math.PI/180), y2=y-r2*Math.cos((a+36)*Math.PI/180)
          return <path key={j} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.6"/>
        })}
      </g>
    ))}
    {/* Elderly man with dogs */}
    <circle cx="18" cy="78" r="4" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M18 82 L16 90 L20 90Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M16 85 L10 82 M20 85 L26 82" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    {/* Staff */}
    <path d="M10 82 L8 68" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Two dogs */}
    <path d="M12 90 L15 85 L18 88 L15 92Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    <path d="M22 90 L25 85 L28 88 L25 92Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
    {/* Young couple */}
    <circle cx="55" cy="75" r="4" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M55 79 L52 88 L58 88Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="62" cy="73" r="4" fill="none" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M62 77 L59 86 L65 86Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Child */}
    <circle cx="48" cy="82" r="3" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <path d="M48 85 L46 92 L50 92Z" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Castle in background */}
    <rect x="28" y="88" width="24" height="20" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M26 88 L40 78 L54 88" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
  </>,

  pentacles_page: <>
    <defs><linearGradient id="pPgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#pPgBg)"/>
    {/* Green meadow */}
    <path d="M0 80 Q20 75 40 78 Q60 81 80 77 L80 120 L0 120Z" fill="rgba(50,80,30,0.15)"/>
    {/* Trees */}
    <path d="M8 100 L8 78" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    <circle cx="8" cy="74" r="6" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    <path d="M72 100 L72 78" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    <circle cx="72" cy="74" r="6" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* Figure */}
    <circle cx="40" cy="42" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Hat with feather */}
    <path d="M34 39 Q40 33 46 39" fill="rgba(50,100,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M44 37 Q48 30 46 26 Q42 30 44 37" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    {/* Tunic */}
    <path d="M40 47.5 L33 70 L47 70Z" fill="rgba(50,100,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 57 L46 57" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 52 L26 58 M44 52 L54 56" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Large pentacle held up, studying it */}
    <circle cx="26" cy="55" r="8" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1.1"/>
    {[0,72,144,216,288].map((a,i)=>{
      const r1=7, r2=3
      const x1=26+r1*Math.sin(a*Math.PI/180), y1=55-r1*Math.cos(a*Math.PI/180)
      const x2=26+r2*Math.sin((a+36)*Math.PI/180), y2=55-r2*Math.cos((a+36)*Math.PI/180)
      return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.8"/>
    })}
    {/* Legs */}
    <path d="M35 70 L33 82 M45 70 L47 82" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Flowers at feet */}
    {[20,30,50,60].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 85 L${x} 80`} stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
        <circle cx={x} cy={79} r="2" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
      </g>
    ))}
  </>,

  pentacles_knight: <>
    <defs><linearGradient id="pKnBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#pKnBg)"/>
    {/* Plowed field */}
    <path d="M0 85 Q40 80 80 85 L80 120 L0 120Z" fill="rgba(80,60,30,0.1)"/>
    {[88,93,98,103,108,113,118].map((y,i)=>(
      <path key={i} d={`M0 ${y} Q40 ${y-3} 80 ${y}`} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
    ))}
    {/* Oak tree */}
    <path d="M65 120 L65 80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <circle cx="65" cy="74" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <circle cx="58" cy="70" r="5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
    <circle cx="72" cy="70" r="5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.3"/>
    {/* Horse standing still */}
    <path d="M15 75 L20 65 L40 62 L58 65 L60 75 L52 82 L22 82Z" fill="rgba(200,200,220,0.06)" stroke="currentColor" strokeWidth="1"/>
    <path d="M58 65 L64 58 L70 62 L62 68Z" fill="none" stroke="currentColor" strokeWidth="0.9"/>
    <circle cx="67" cy="57" r="1.5" fill="currentColor" opacity="0.6"/>
    <path d="M22 82 L20 92 M38 82 L36 92 M52 82 L50 92" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Knight */}
    <circle cx="38" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    {/* Helmet with oak leaves */}
    <path d="M33 45 Q38 39 43 45" fill="rgba(50,100,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M33 43 Q30 38 32 35 Q36 38 33 43" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    <path d="M43 43 Q46 38 44 35 Q40 38 43 43" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    {/* Armor */}
    <path d="M38 53 L34 65 L42 65Z" fill="rgba(150,150,200,0.1)" stroke="currentColor" strokeWidth="1"/>
    {/* Arms */}
    <path d="M34 56 L26 52 M42 56 L52 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Pentacle held and studied */}
    <circle cx="52" cy="50" r="6" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    {[0,72,144,216,288].map((a,i)=>{
      const r1=5, r2=2.2
      const x1=52+r1*Math.sin(a*Math.PI/180), y1=50-r1*Math.cos(a*Math.PI/180)
      const x2=52+r2*Math.sin((a+36)*Math.PI/180), y2=50-r2*Math.cos((a+36)*Math.PI/180)
      return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.7"/>
    })}
    {/* Legs */}
    <path d="M35 65 L33 75 M41 65 L43 75" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </>,

  pentacles_queen: <>
    <defs><linearGradient id="pQnBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#pQnBg)"/>
    {/* Lush garden throne */}
    <rect x="22" y="55" width="36" height="50" rx="2" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5"/>
    <path d="M22 55 L22 45 L28 50 L40 42 L52 50 L58 45 L58 55" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    {/* Flowers and vines on throne */}
    {[24,36,48,56].map((x,i)=>(
      <g key={i}>
        <path d={`M${x} 60 L${x} 55`} stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" opacity="0.4"/>
        <circle cx={x} cy={53} r="2" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4"/>
      </g>
    ))}
    {/* Rabbit at feet */}
    <path d="M25 88 L28 82 Q32 80 35 84 L35 90Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
    <circle cx="27" cy="81" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    <path d="M26 80 L25 77 M28 80 L28 77" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.4"/>
    {/* Queen */}
    <circle cx="40" cy="42" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="38.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="41.5" cy="40.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M38.5 44 Q40 45.5 41.5 44" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown with flowers */}
    <path d="M34 38 L36 32 L40 36 L44 32 L46 38" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M34 38 L46 38" stroke="currentColor" strokeWidth="1"/>
    {/* Flower in crown */}
    <circle cx="40" cy="34" r="2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5"/>
    {/* Robe */}
    <path d="M40 47.5 L33 72 L47 72Z" fill="rgba(50,100,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    <path d="M34 58 L46 58 M34 65 L46 65" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M36 52 L26 58 M44 52 L54 56" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Large pentacle in lap */}
    <circle cx="40" cy="62" r="8" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1"/>
    {[0,72,144,216,288].map((a,i)=>{
      const r1=7, r2=3
      const x1=40+r1*Math.sin(a*Math.PI/180), y1=62-r1*Math.cos(a*Math.PI/180)
      const x2=40+r2*Math.sin((a+36)*Math.PI/180), y2=62-r2*Math.cos((a+36)*Math.PI/180)
      return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.8"/>
    })}
    {/* Legs */}
    <path d="M35 72 L33 85 M45 72 L47 85" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Garden background */}
    <path d="M0 88 Q20 83 40 86 Q60 89 80 85 L80 120 L0 120Z" fill="rgba(50,80,30,0.1)"/>
  </>,

  pentacles_king: <>
    <defs><linearGradient id="pKgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001a00" stopOpacity="0.9"/><stop offset="100%" stopColor="#000a00" stopOpacity="0.85"/></linearGradient></defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#pKgBg)"/>
    {/* Castle */}
    <rect x="48" y="50" width="25" height="35" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M48 50 L48 42 L53 45 L58 40 L63 45 L68 40 L73 45 L73 50" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    {/* Vines on throne */}
    <rect x="18" y="50" width="40" height="55" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M18 50 L18 40 L24 45 L38 37 L52 45 L58 40 L58 50" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    {/* Grape clusters on throne */}
    {[20,54].map((x,i)=>(
      <g key={i}>
        {[[x,55],[x+2,58],[x-2,58],[x,61],[x+2,64],[x-2,64]].map(([px,py],j)=>(
          <circle key={j} cx={px} cy={py} r="1.5" fill="rgba(100,50,150,0.2)" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
        ))}
      </g>
    ))}
    {/* Bull head on throne */}
    <path d="M34 48 Q38 44 42 48" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
    <path d="M34 46 Q32 42 34 40 M42 46 Q44 42 42 40" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/>
    {/* King */}
    <circle cx="38" cy="38" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="36.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <circle cx="39.5" cy="36.5" r="0.7" fill="currentColor" opacity="0.8"/>
    <path d="M36.5 40 Q38 41.5 39.5 40" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    {/* Crown */}
    <path d="M32 34 L34 28 L38 32 L42 28 L44 34" fill="rgba(200,150,50,0.2)" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M32 34 L44 34" stroke="currentColor" strokeWidth="1"/>
    {/* Robe with bull/pentacle pattern */}
    <path d="M38 43.5 L31 68 L45 68Z" fill="rgba(50,100,50,0.15)" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M32 53 L44 53 M32 60 L44 60" stroke="currentColor" strokeWidth="0.8"/>
    {/* Arms */}
    <path d="M34 48 L24 54 M42 48 L52 52" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    {/* Large pentacle scepter */}
    <path d="M52 52 L55 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="55" cy="34" r="6" fill="rgba(200,150,50,0.1)" stroke="currentColor" strokeWidth="1.1"/>
    {[0,72,144,216,288].map((a,i)=>{
      const r1=5, r2=2.2
      const x1=55+r1*Math.sin(a*Math.PI/180), y1=34-r1*Math.cos(a*Math.PI/180)
      const x2=55+r2*Math.sin((a+36)*Math.PI/180), y2=34-r2*Math.cos((a+36)*Math.PI/180)
      return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="currentColor" strokeWidth="0.7"/>
    })}
    {/* Orb */}
    <circle cx="24" cy="54" r="4" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M24 50 L24 58 M20 54 L28 54" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Legs */}
    <path d="M33 68 L31 80 M43 68 L45 80" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    {/* Garden ground */}
    <path d="M0 88 Q20 83 40 86 Q60 89 80 85 L80 120 L0 120Z" fill="rgba(50,80,30,0.1)"/>
  </>,
}

// ══════════════════════════════════════════════════════════════
// CARD BACK DESIGN
// ══════════════════════════════════════════════════════════════
const CardBack = () => (
  <>
    <defs>
      <linearGradient id="backBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0d1b2a"/>
        <stop offset="50%" stopColor="#1a0a2e"/>
        <stop offset="100%" stopColor="#0a1a1a"/>
      </linearGradient>
      <radialGradient id="backGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#C9954A" stopOpacity="0.15"/>
        <stop offset="100%" stopColor="#C9954A" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="80" height="120" fill="url(#backBg)"/>
    <rect x="0" y="0" width="80" height="120" fill="url(#backGlow)"/>
    {/* Outer border */}
    <rect x="3" y="3" width="74" height="114" rx="3" fill="none" stroke="rgba(201,149,74,0.5)" strokeWidth="1"/>
    <rect x="5" y="5" width="70" height="110" rx="2" fill="none" stroke="rgba(201,149,74,0.25)" strokeWidth="0.5"/>
    {/* Corner ornaments */}
    {[[8,8],[72,8],[8,112],[72,112]].map(([cx,cy],i)=>(
      <g key={i}>
        <circle cx={cx} cy={cy} r="3" fill="none" stroke="rgba(201,149,74,0.5)" strokeWidth="0.8"/>
        <circle cx={cx} cy={cy} r="1.2" fill="rgba(201,149,74,0.3)"/>
        <path d={`M${cx-5} ${cy} L${cx+5} ${cy} M${cx} ${cy-5} L${cx} ${cy+5}`} stroke="rgba(201,149,74,0.3)" strokeWidth="0.5"/>
      </g>
    ))}
    {/* Central compass rose */}
    <circle cx="40" cy="60" r="22" fill="none" stroke="rgba(201,149,74,0.2)" strokeWidth="0.8"/>
    <circle cx="40" cy="60" r="16" fill="none" stroke="rgba(201,149,74,0.3)" strokeWidth="0.6"/>
    <circle cx="40" cy="60" r="8" fill="none" stroke="rgba(201,149,74,0.4)" strokeWidth="0.8"/>
    <circle cx="40" cy="60" r="3" fill="rgba(201,149,74,0.2)" stroke="rgba(201,149,74,0.5)" strokeWidth="0.8"/>
    {/* Compass points */}
    {[0,45,90,135,180,225,270,315].map((a,i)=>{
      const r1=8, r2=i%2===0?22:16
      const x1=40+r1*Math.sin(a*Math.PI/180), y1=60-r1*Math.cos(a*Math.PI/180)
      const x2=40+r2*Math.sin(a*Math.PI/180), y2=60-r2*Math.cos(a*Math.PI/180)
      return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={`rgba(201,149,74,${i%2===0?0.5:0.3})`} strokeWidth={i%2===0?0.8:0.5}/>
    })}
    {/* Cardinal direction diamonds */}
    {[0,90,180,270].map((a,i)=>{
      const r=22
      const cx=40+r*Math.sin(a*Math.PI/180), cy=60-r*Math.cos(a*Math.PI/180)
      return <path key={i} d={`M${cx} ${cy-3} L${cx+2} ${cy} L${cx} ${cy+3} L${cx-2} ${cy}Z`} fill="rgba(201,149,74,0.4)" stroke="rgba(201,149,74,0.6)" strokeWidth="0.5"/>
    })}
    {/* Diagonal cross lines */}
    <path d="M8 8 L72 112 M72 8 L8 112" stroke="rgba(201,149,74,0.06)" strokeWidth="0.5"/>
    {/* Star pattern */}
    {[0,72,144,216,288].map((a,i)=>{
      const r1=22, r2=10
      const x1=40+r1*Math.sin(a*Math.PI/180), y1=60-r1*Math.cos(a*Math.PI/180)
      const x2=40+r2*Math.sin((a+36)*Math.PI/180), y2=60-r2*Math.cos((a+36)*Math.PI/180)
      return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="rgba(201,149,74,0.15)" strokeWidth="0.5"/>
    })}
    {/* Top and bottom text area */}
    <path d="M12 15 Q40 10 68 15" fill="none" stroke="rgba(201,149,74,0.2)" strokeWidth="0.5"/>
    <path d="M12 105 Q40 110 68 105" fill="none" stroke="rgba(201,149,74,0.2)" strokeWidth="0.5"/>
    {/* Decorative dots */}
    {[15,25,35,45,55,65].map((x,i)=>(
      <circle key={i} cx={x} cy={13} r="0.8" fill="rgba(201,149,74,0.3)"/>
    ))}
    {[15,25,35,45,55,65].map((x,i)=>(
      <circle key={i} cx={x} cy={107} r="0.8" fill="rgba(201,149,74,0.3)"/>
    ))}
  </>
)

// ══════════════════════════════════════════════════════════════
// MAIN TAROT CARD COMPONENT
// Flat props interface — matches all page call sites
// ══════════════════════════════════════════════════════════════
export interface TarotCardProps {
  // Required
  name: string
  // Optional card metadata
  nameEn?: string
  suit?: string        // 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'
  arcana?: string
  number?: number
  symbol?: string      // maps to CARD_ART key, e.g. 'fool', 'wands_ace'
  orientation?: string // '正位' | '逆位'
  keywords?: string
  // Display state
  flipped?: boolean    // true = show front face
  glowing?: boolean    // glow animation on back
  small?: boolean      // shorthand for size='sm'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

const sizeMap = {
  sm:  { width: 80,  height: 120 },
  md:  { width: 107, height: 160 },
  lg:  { width: 160, height: 240 },
}

const suitColorMap: Record<string, string> = {
  major:     '#C9954A',
  wands:     '#E8783A',
  cups:      '#5B8CBF',
  swords:    '#9882C0',
  pentacles: '#6BAF8D',
}

export function TarotCard({
  name, nameEn, suit, arcana, number, symbol,
  orientation, keywords,
  flipped = false, glowing = false,
  small = false,
  size = 'md', onClick, className = '',
}: TarotCardProps) {
  const resolvedSize = small ? 'sm' : size
  const { width, height } = sizeMap[resolvedSize]
  const resolvedSuit = suit || (arcana === 'major' ? 'major' : 'major')
  const accentColor = suitColorMap[resolvedSuit] || '#C9954A'
  const isReversed = orientation === '逆位'

  // Look up card art by symbol field (e.g. 'fool', 'wands_ace')
  const cardArt = symbol ? CARD_ART[symbol as keyof typeof CARD_ART] : undefined

  return (
    <div
      className={`tarot-card-wrapper ${className}`}
      style={{
        width, height,
        cursor: onClick ? 'pointer' : 'default',
        perspective: '1000px',
        filter: glowing ? 'drop-shadow(0 8px 24px rgba(201,149,74,0.35))' : 'none',
        transition: 'filter 0.3s ease',
      }}
      onClick={onClick}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── Card Back ── */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <svg viewBox="0 0 80 120" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
            <CardBack />
          </svg>
        </div>

        {/* ── Card Front ── */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 8, overflow: 'hidden',
          boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}40`,
        }}>
          <svg
            viewBox="0 0 80 120"
            width={width}
            height={height}
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: isReversed ? 'rotate(180deg)' : 'none', display: 'block' }}
          >
            <defs>
              <linearGradient id={`cardFg_${symbol || name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d1b2a"/>
                <stop offset="100%" stopColor="#050a10"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="80" height="120" fill={`url(#cardFg_${symbol || name})`}/>

            {/* Card art */}
            <g style={{ color: accentColor }}>
              {cardArt || (
                <g>
                  <circle cx="40" cy="55" r="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                  <circle cx="40" cy="55" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
                  <path d="M40 33 L40 77 M18 55 L62 55 M24 39 L56 71 M56 39 L24 71" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>
                  <text x="40" y="60" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.5" fontFamily="serif">{name}</text>
                </g>
              )}
            </g>

            {/* Card frame */}
            <rect x="2" y="2" width="76" height="116" rx="3" fill="none" stroke={accentColor} strokeWidth="0.8" opacity="0.5"/>
            <rect x="4" y="4" width="72" height="112" rx="2" fill="none" stroke={accentColor} strokeWidth="0.4" opacity="0.25"/>

            {/* Corner ornaments */}
            {([[6,6],[74,6],[6,114],[74,114]] as [number,number][]).map(([cx,cy],i)=>(
              <circle key={i} cx={cx} cy={cy} r="1.5" fill={accentColor} opacity="0.4"/>
            ))}

            {/* Card name at bottom */}
            <rect x="4" y="108" width="72" height="10" rx="1" fill="rgba(0,0,0,0.6)"/>
            <text x="40" y="116" textAnchor="middle" fill={accentColor} fontSize="5.5" fontFamily="serif" letterSpacing="0.5" opacity="0.9">
              {name}
            </text>

            {/* Reversed indicator */}
            {isReversed && (
              <text x="40" y="10" textAnchor="middle" fill={accentColor} fontSize="4" opacity="0.6" fontFamily="serif">
                ▽ 逆位
              </text>
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── Static (non-animated) card display ──
export interface TarotCardStaticProps {
  name: string
  suit?: string
  arcana?: string
  symbol?: string
  orientation?: string
  size?: 'sm' | 'md' | 'lg'
  showBack?: boolean
}

export function TarotCardStatic({ name, suit, arcana, symbol, orientation, size = 'md', showBack = false }: TarotCardStaticProps) {
  const { width, height } = sizeMap[size]
  const resolvedSuit = suit || (arcana === 'major' ? 'major' : 'major')
  const accentColor = suitColorMap[resolvedSuit] || '#C9954A'
  const isReversed = orientation === '逆位'
  const cardArt = symbol ? CARD_ART[symbol as keyof typeof CARD_ART] : undefined

  if (showBack) {
    return (
      <svg viewBox="0 0 80 120" width={width} height={height} xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'block' }}>
        <CardBack />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 80 120" width={width} height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: 8,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}40`,
        transform: isReversed ? 'rotate(180deg)' : 'none',
        display: 'block',
      }}
    >
      <defs>
        <linearGradient id={`sfg_${symbol || name}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1b2a"/>
          <stop offset="100%" stopColor="#050a10"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="80" height="120" fill={`url(#sfg_${symbol || name})`}/>
      <g style={{ color: accentColor }}>
        {cardArt || (
          <g>
            <circle cx="40" cy="55" r="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
            <text x="40" y="60" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.5" fontFamily="serif">{name}</text>
          </g>
        )}
      </g>
      <rect x="2" y="2" width="76" height="116" rx="3" fill="none" stroke={accentColor} strokeWidth="0.8" opacity="0.5"/>
      {([[6,6],[74,6],[6,114],[74,114]] as [number,number][]).map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="1.5" fill={accentColor} opacity="0.4"/>
      ))}
      <rect x="4" y="108" width="72" height="10" rx="1" fill="rgba(0,0,0,0.6)"/>
      <text x="40" y="116" textAnchor="middle" fill={accentColor} fontSize="5.5" fontFamily="serif" letterSpacing="0.5" opacity="0.9">
        {name}
      </text>
      {isReversed && (
        <text x="40" y="10" textAnchor="middle" fill={accentColor} fontSize="4" opacity="0.6" fontFamily="serif">▽ 逆位</text>
      )}
    </svg>
  )
}

export default TarotCard
