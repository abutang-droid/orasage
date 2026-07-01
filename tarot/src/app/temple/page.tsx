"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"

// ─── Deity Data ────────────────────────────────────────────────────
const DEITIES = [
  // Latin America
  { id: "aparecida", name: "Aparecida", nameEN: "Nossa Senhora Aparecida", tradition: "latin", region: "Brazil", domains: ["奇迹","母爱","庇护"], color: "#1A3A5C", gradient: "linear-gradient(160deg, #1A3A5C, #2A4A6C)", imageUrl: "/gods/Aparecida.webp" },
  { id: "guadalupe", name: "Guadalupe", nameEN: "Virgen de Guadalupe", tradition: "latin", region: "Mexico/CentralAmerica", domains: ["慈悲","家庭","底层守护"], color: "#8B2E3A", gradient: "linear-gradient(160deg, #5B1A25, #8B2E3A)", imageUrl: "/gods/Guadalupe.webp" },
  { id: "lujan", name: "Luján", nameEN: "Nuestra Señora de Luján", tradition: "latin", region: "Argentina", domains: ["旅人保护","平安","方向"], color: "#5B8FA6", gradient: "linear-gradient(160deg, #3A6070, #5B8FA6)", imageUrl: "/gods/Luján.webp" },
  { id: "santonino", name: "Santo Niño", nameEN: "Santo Niño de Cebú", tradition: "latin", region: "Philippines", domains: ["奇迹","希望","孩子"], color: "#8B2020", gradient: "linear-gradient(160deg, #5B1010, #8B2020)", imageUrl: "/gods/Santo Niño.webp" },
  // Southeast Asia
  { id: "guanyin", name: "观音", nameEN: "Guan Yin", tradition: "seasia", region: "Thailand/ChineseDiaspora", domains: ["慈悲","救苦","子嗣"], color: "#D4C8C0", gradient: "linear-gradient(160deg, #B8ACA4, #F0E8E0)", imageUrl: "/gods/观音.webp" },
  { id: "brahma", name: "四面佛", nameEN: "Brahma", tradition: "seasia", region: "Thailand", domains: ["全能护佑","事业","财运"], color: "#C9954A", gradient: "linear-gradient(160deg, #A67A38, #D4A853)", imageUrl: "/gods/四面佛.webp" },
  { id: "ganesha", name: "象神", nameEN: "Ganesha", tradition: "seasia", region: "India/Thailand", domains: ["除障","智慧","学业"], color: "#D4782A", gradient: "linear-gradient(160deg, #B06020, #E89040)", imageUrl: "/gods/象神.webp" },
  { id: "mazu", name: "妈祖", nameEN: "Mazu", tradition: "seasia", region: "ChineseDiaspora", domains: ["出海平安","女性力量"], color: "#8B2020", gradient: "linear-gradient(160deg, #5B1010, #A03030)", imageUrl: "/gods/妈祖.webp" },
]

type Deity = typeof DEITIES[number]

// ─── Worship Halo Animation ────────────────────────────────────────
function HaloRings({ stage, deityColor }: { stage: number; deityColor: string }) {
  const alpha = stage >= 3 ? 0.4 : stage >= 2 ? 0.25 : stage >= 1 ? 0.12 : 0.04
  const radius1 = stage === 1 ? 90 : stage === 2 ? 130 : stage >= 3 ? 180 : 60
  const radius2 = stage === 2 ? 180 : stage >= 3 ? 240 : 90

  return (
    <>
      {/* Ring 1 */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: radius1 * 2, height: radius1 * 2,
        transform: 'translate(-50%,-50%)',
        borderRadius: '50%',
        border: `1px solid ${deityColor}`,
        opacity: alpha,
        transition: 'all 0.8s var(--ease-out)',
      }} />
      {/* Ring 2 */}
      {stage >= 2 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: radius2 * 2, height: radius2 * 2,
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          border: `0.5px solid ${deityColor}`,
          opacity: alpha * 0.6,
          transition: 'all 0.8s var(--ease-out)',
        }} />
      )}
    </>
  )
}

// ─── Particle Effect ───────────────────────────────────────────────
function Particles({ stage }: { stage: number }) {
  const count = stage === 1 ? 15 : stage === 2 ? 35 : stage >= 3 ? 70 : 0
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + Math.random() * 30,
    distance: 40 + Math.random() * 100,
    delay: Math.random() * 0.5,
    size: 2 + Math.random() * 3,
    opacity: 0.3 + Math.random() * 0.5,
  }))

  return (
    <>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: 'var(--gold-light)',
          opacity: p.opacity,
          transform: `translate(-50%,-50%) rotate(${p.angle}deg) translateY(-${p.distance}px)`,
          animation: `particle-rise 2s ease-out ${p.delay}s infinite`,
        }} />
      ))}
    </>
  )
}

// ─── Worship Screen ────────────────────────────────────────────────
function WorshipScreen({ deity, onComplete }: { deity: Deity; onComplete: (duration: number, stage: number) => void }) {
  const [isPressed, setIsPressed] = useState(false)
  const [stage, setStage] = useState(0) // 0=idle, 1=3s, 2=7s, 3=10s
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const startHolding = useCallback(() => {
    setIsPressed(true)
    startTimeRef.current = Date.now()
    setElapsed(0)
    setStage(0)

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      setElapsed(elapsed)
      if (elapsed >= 10) setStage(3)
      else if (elapsed >= 7) setStage(2)
      else if (elapsed >= 3) setStage(1)
    }, 100)
  }, [])

  const stopHolding = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsPressed(false)
    const duration = (Date.now() - startTimeRef.current) / 1000

    if (duration < 1) {
      setElapsed(0); setStage(0); return // too short
    }
    if (duration < 3) {
      setStage(1)
      setTimeout(() => { setStage(0); setElapsed(0) }, 500)
      return
    }

    onComplete(duration, stage >= 3 ? 3 : stage >= 2 ? 2 : 1)
  }, [stage, onComplete])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 32, position: 'relative',
    }}>
      {/* Backdrop vignette */}
      {stage >= 3 && (
        <div style={{
          position: 'fixed', inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(13,13,13,0.6) 100%)`,
          pointerEvents: 'none', zIndex: 0, transition: 'opacity 0.5s ease',
        }} />
      )}

      {/* Deity display */}
      <div style={{
        position: 'relative', width: 200, height: 200, marginBottom: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
      }}>
        <HaloRings stage={stage} deityColor={deity.color} />
        <Particles stage={isPressed ? stage : 0} />

        {/* Deity image */}
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: stage >= 2 ? `0 0 40px ${deity.color}44` : '0 0 10px rgba(0,0,0,0.3)',
          transition: 'all 0.5s var(--ease-out)',
          transform: stage >= 3 ? 'scale(1.05)' : 'scale(1)',
          position: 'relative', zIndex: 2,
          border: `2px solid ${stage >= 2 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
        }}>
          <img src={deity.imageUrl} alt={deity.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      <div style={{
        fontSize: 20, fontWeight: 600, color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)', marginBottom: 8,
        letterSpacing: '0.04em',
      }}>
        {deity.name}
      </div>
      <div style={{
        fontSize: 12, color: 'var(--text-muted)', marginBottom: 32,
        fontFamily: 'var(--font-sans)',
      }}>
        {deity.nameEN}
      </div>

      {/* Touch area */}
      {!isPressed || elapsed < 3 ? (
        <div style={{
          textAlign: 'center', marginBottom: 24,
          fontSize: 15, color: 'var(--text-secondary)',
          fontFamily: 'var(--font-serif)',
        }}>
          把手指放在神像上
        </div>
      ) : null}

      <div
        onTouchStart={e => { e.preventDefault(); startHolding() }}
        onTouchEnd={e => { e.preventDefault(); stopHolding() }}
        onMouseDown={startHolding}
        onMouseUp={stopHolding}
        onMouseLeave={stopHolding}
        style={{
          width: 160, height: 160,
          borderRadius: '50%',
          border: `2px dashed ${isPressed ? 'var(--gold-light)' : 'var(--border-focus)'}`,
          cursor: 'pointer', userSelect: 'none',
          transition: 'all 0.3s ease',
          opacity: isPressed ? 0.8 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 1,
          background: isPressed ? 'var(--bg-card-hover)' : 'transparent',
        }}
      >
        <div style={{
          fontSize: 13, color: 'var(--text-muted)',
          textAlign: 'center', fontFamily: 'var(--font-sans)',
          padding: '0 20px',
        }}>
          {isPressed
            ? stage >= 3 ? "虔诚之巅 ✦" : stage >= 2 ? "圣光展开中..." : stage >= 1 ? "光环渐起..." : "继续按住..."
            : "手指按住这里\n感受临在"}
        </div>
      </div>

      {/* Progress indicator */}
      {isPressed && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{
            width: 120, height: 3, background: 'var(--border)',
            borderRadius: 2, margin: '0 auto', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: 'var(--gold-light)',
              width: `${Math.min(elapsed / 10 * 100, 100)}%`,
              borderRadius: 2, transition: 'width 0.1s linear',
            }} />
          </div>
          <div style={{
            marginTop: 6, fontSize: 11, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
            {elapsed < 1 ? "按住以持续参拜" :
             elapsed < 3 ? `${Math.round(elapsed)}s · 光环渐起` :
             elapsed < 7 ? `${Math.round(elapsed)}s · 光环扩散` :
             elapsed < 10 ? `${Math.round(elapsed)}s · 圣光展开` :
             "虔诚之巅 · 松手完成参拜"}
          </div>
        </div>
      )}

      {/* Too-short toast */}
      {!isPressed && elapsed > 0 && elapsed < 1 && (
        <div style={{
          marginTop: 16, fontSize: 13, color: 'var(--text-secondary)',
          fontFamily: 'var(--font-serif)', textAlign: 'center',
        }}>
          再按一会，{deity.name}正在聆听
        </div>
      )}
    </div>
  )
}

// ─── Blessing End Screen ───────────────────────────────────────────
function BlessingScreen({ deity, duration, stage, onDone }: {
  deity: Deity; duration: number; stage: number; onDone: () => void
}) {
  const peakLabel = stage === 3 ? "虔诚之巅" : stage === 2 ? "深度参拜" : "参拜完成"
  const merit = stage === 3 ? 10 : stage === 2 ? 5 : 1

  return (
    <div className="animate-fade-in-up" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 48, textAlign: 'center',
    }}>
      {/* Small deity image */}
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        overflow: 'hidden', marginBottom: 24,
        boxShadow: `0 0 20px ${deity.color}33`,
      }}>
        <img src={deity.imageUrl} alt={deity.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
        color: 'var(--gold-light)', marginBottom: 16,
        letterSpacing: '0.06em',
      }}>
        {peakLabel}
      </div>

      <div style={{
        fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24,
        maxWidth: 300, lineHeight: 1.7, fontFamily: 'var(--font-serif)',
      }}>
        {deity.name}已将你的心愿放在了最靠近星辰的地方。
      </div>

      {/* AI blessing placeholder */}
      <div style={{
        padding: '20px 24px', background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
        marginBottom: 24, maxWidth: 340,
      }}>
        <div style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 10, letterSpacing: '0.1em', fontFamily: 'var(--font-display)' }}>
          ── 今日指引 ──
        </div>
        <div style={{
          fontSize: 14, color: 'var(--text-primary)',
          lineHeight: 1.8, fontFamily: 'var(--font-serif)',
        }}>
          她看见你心里的那团火——<br />
          那是还没说出口的话。<br />
          今天，向前走一步。
        </div>
      </div>

      {/* Merit earned */}
      <div style={{
        fontSize: 12, color: 'var(--gold-light)', marginBottom: 24,
        fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
        background: 'rgba(201,149,74,0.1)', padding: '6px 16px',
        borderRadius: 'var(--radius-pill)',
      }}>
        +{merit} 功德
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
        <Link href="/reading" className="btn-primary" style={{
          display: 'flex', justifyContent: 'center', textDecoration: 'none',
        }}>
          🔮 去占卜
        </Link>
        <button className="btn-ghost" style={{ width: '100%' }}>
          📤 分享到 WhatsApp
        </button>
        <button onClick={onDone} style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          fontSize: 13, cursor: 'pointer', padding: '10px 0',
          fontFamily: 'var(--font-sans)',
        }}>
          返回
        </button>
      </div>
    </div>
  )
}

// ─── Main Temple Page ──────────────────────────────────────────────
export default function TemplePage() {
  const [selectedDeity, setSelectedDeity] = useState<Deity | null>(null)
  const [savedDeity, setSavedDeity] = useState<Deity | null>(null)
  const [phase, setPhase] = useState<"select" | "worship" | "blessing">("select")
  const [blessingData, setBlessingData] = useState<{ duration: number; stage: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Load saved deity from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("manto:deity")
    if (saved) {
      try {
        const deityId = JSON.parse(saved).id
        const deity = DEITIES.find(d => d.id === deityId)
        if (deity) setSavedDeity(deity)
      } catch {}
    }
  }, [])

  const handleSelectDeity = useCallback((deity: Deity) => {
    setSelectedDeity(deity)
    // Save to localStorage
    localStorage.setItem("manto:deity", JSON.stringify({ id: deity.id, name: deity.name }))
    setSavedDeity(deity)
    setPhase("worship")
  }, [])

  const handleWorshipComplete = useCallback((duration: number, stage: number) => {
    setBlessingData({ duration, stage })
    setPhase("blessing")
  }, [])

  const handleBlessingDone = useCallback(() => {
    setPhase("select")
    setBlessingData(null)
  }, [])

  const filteredDeities = DEITIES.filter(d =>
    !searchQuery || d.name.includes(searchQuery) || d.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) || d.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Select Deity ──
  if (phase === "select") {
    return (
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ paddingTop: 32 }}>
          <div className="page-header" style={{ padding: '16px 0' }}>
            <span className="label">🛐 每日拜神</span>
            <h1>谁在守护你？</h1>
            <p>选择你的守护神，把手指放在神像上</p>
          </div>

          {/* Saved deity — quick re-worship */}
          {!searchQuery && savedDeity && (
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src={savedDeity.imageUrl} alt={savedDeity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                  {savedDeity.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  你的守护神
                </div>
              </div>
              <button
                onClick={() => handleSelectDeity(savedDeity)}
                className="btn-primary small"
                style={{ fontSize: 12, padding: '6px 14px', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}
              >
                🛐 参拜
              </button>
            </div>
          )}

          {/* Search */}
          <div style={{ marginBottom: 24 }}>
            <input className="input-field" placeholder="🔍 搜索你想拜的神明..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery && filteredDeities.length === 0 && (
            <div className="card-gold" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>
                没有找到「{searchQuery}」
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                你想拜的神明还不在我们的体系中。但我们听到了。
              </div>
              <button className="btn-outline" style={{ width: '100%' }}>
                🙏 我也在等 · 凑满 100 位信徒即上线
              </button>
            </div>
          )}

          {/* Deity grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
            {filteredDeities.map(deity => (
              <button
                key={deity.id}
                onClick={() => handleSelectDeity(deity)}
                style={{
                  padding: '16px 14px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.15s ease',
                  color: 'var(--text-primary)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  overflow: 'hidden',
                }}>
                  <img src={deity.imageUrl} alt={deity.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    fontFamily: 'var(--font-serif)', marginBottom: 2,
                  }}>{deity.name}</div>
                  <div style={{
                    fontSize: 10, color: 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    {deity.nameEN}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Worship ──
  if (phase === "worship" && selectedDeity) {
    return (
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
        <WorshipScreen deity={selectedDeity} onComplete={handleWorshipComplete} />
      </div>
    )
  }

  // ── Blessing ──
  if (phase === "blessing" && selectedDeity && blessingData) {
    return (
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
        <BlessingScreen
          deity={selectedDeity}
          duration={blessingData.duration}
          stage={blessingData.stage}
          onDone={handleBlessingDone}
        />
      </div>
    )
  }

  return null
}
