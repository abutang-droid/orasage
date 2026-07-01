"use client"
import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import CardFrame from "@/components/CardFrame"
import { getCardById } from "@/lib/tarot/cards"
import { useUser } from "@/lib/user"

const CACHE_KEY = "manto:profile"
function loadCachedProfile(): Record<string, string> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function cacheProfile(fields: Record<string, string>) {
  try {
    const existing = loadCachedProfile() || {}
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...existing, ...fields }))
  } catch {}
}

// ─── Types ─────────────────────────────────────────────────────────
type ReadingStep = "shuffle" | "revealing" | "interpreting" | "synthesis" | "profile" | "crystal_quiz" | "blessing"

interface CardData {
  position: string
  positionLabel: string
  cardName: string
  cardNameEn: string
  cardId: number
  orientation: "正位" | "逆位"
  element: string
  interpretation: string
  mantra: string
  revealed: boolean
}

// ─── CardFlip — full-screen, touch-first card reveal ──────────────
function CardFlip({
  card, positionLabel, onReveal, disabled,
}: {
  card: CardData; positionLabel: string; onReveal: () => void; disabled: boolean
}) {
  const [flipping, setFlipping] = useState(false)
  const [rProgress, setRProgress] = useState(0)
  const cardDef = getCardById(card.cardId)

  const handleTap = () => {
    if (disabled || flipping || card.revealed) return
    setFlipping(true)
    setRProgress(0)
    const start = performance.now()
    const duration = 400
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setRProgress(p)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    setTimeout(() => { setFlipping(false); onReveal() }, 500)
  }

  const frontVisible = rProgress > 0.5
  const infoLabel = card.revealed ? `${positionLabel} · ${card.orientation}` : positionLabel

  // Card fills 72% of viewport width
  const [vw, setVw] = useState(260)
  useEffect(() => {
    setVw(Math.min(320, Math.round(window.innerWidth * 0.72)))
    const onR = () => setVw(Math.min(320, Math.round(window.innerWidth * 0.72)))
    window.addEventListener("resize", onR)
    return () => window.removeEventListener("resize", onR)
  }, [])

  const fPad = Math.round(vw * 0.025)
  const pH = Math.round(vw * 0.12)
  const cH = Math.round(vw * 1.48)
  const totalH = cH + fPad * 2 + pH

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* Label above card */}
      <div style={{
        fontSize: 11, color: 'var(--gold-light)', fontFamily: 'var(--font-sans)',
        letterSpacing: '0.08em', textAlign: 'center', minHeight: 18, lineHeight: '18px',
      }}>
        {infoLabel}
      </div>

      {/* Touch target — large, thumb-friendly */}
      <button
        onClick={handleTap}
        disabled={disabled || card.revealed}
        style={{
          background: 'none', border: 'none', padding: 0,
          display: 'block', position: 'relative',
          width: vw + fPad * 2, height: totalH,
          perspective: '900px',
          cursor: card.revealed ? 'default' : 'pointer',
          opacity: disabled ? 0.35 : 1,
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-label={card.revealed ? `${card.cardName} — ${card.orientation}` : `翻开${positionLabel}的牌`}
      >
        <div style={{
          width: '100%', height: '100%', position: 'relative',
          transformStyle: 'preserve-3d',
          transform: card.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: flipping ? 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}>
          {/* Back */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
            <CardFrame back width={vw} glow />
          </div>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: 'rotateY(180deg)',
            opacity: card.revealed ? 1 : frontVisible ? 1 : 0,
            transition: flipping ? 'none' : 'opacity 0s',
          }}>
            <CardFrame card={cardDef} width={vw} revealed glow={false} noPlaque />
          </div>
        </div>
      </button>
    </div>
  )
}

// ─── Progress dots — subtle, not a desktop wizard ─────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '12px 0' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: i < current ? 'var(--gold)' : 'var(--border)',
          transition: 'background 0.3s ease',
        }} />
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────
export default function ReadingPage() {
  const [step, setStep] = useState<ReadingStep>("shuffle")
  const [cards, setCards] = useState<CardData[]>([])
  const [synthesisText, setSynthesisText] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [blessing, setBlessing] = useState<{ wuxing: string; crystalName: string; affirmation: string } | null>(null)
  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<{wuxing:string;label:string}[]>([])
  const [quizData, setQuizData] = useState<{questions:{question:string;options:{label:string;wuxing:string}[]}[]}|null>(null)
  const [profileStep, setProfileStep] = useState(0)
  const { user, saveProfile } = useUser()
  const [profile, setProfile] = useState({ name: "", birthdate: "", gender: "", occupation: "" })

  // Determine if user has a saved profile (check both server + localStorage)
  const alreadySaved = user
    ? (() => {
        const cached = loadCachedProfile()
        const name = cached?.nickname || user.nickname || ""
        return (
          (name && name !== "旅人") ||
          !!(cached?.birthday || user.birthday) ||
          !!(cached?.gender || user.gender) ||
          !!(cached?.occupation || user.occupation)
        )
      })()
    : false

  // Pull stored profile into local state when user loads
  useEffect(() => {
    if (!user) return
    const cached = loadCachedProfile()
    const name = (cached?.nickname && cached.nickname !== "旅人") ? cached.nickname
      : (user.nickname && user.nickname !== "旅人") ? user.nickname : ""
    const bday = cached?.birthday || (user.birthday ? String(user.birthday).slice(0, 10) : "")
    const gender = cached?.gender || user.gender || ""
    const occupation = cached?.occupation || user.occupation || ""
    setProfile({ name, birthdate: bday, gender, occupation })
  }, [user])
  const [readingId, setReadingId] = useState<string | null>(null)

  const crystalMap: Record<string, { name: string; emoji: string }> = {
    "木": { name: "绿幽灵", emoji: "🌿" },
    "火": { name: "红玛瑙", emoji: "🔥" },
    "土": { name: "黄水晶", emoji: "⛰️" },
    "金": { name: "白水晶", emoji: "✨" },
    "水": { name: "黑曜石", emoji: "💧" },
  }

  // ── Auto-start ──────────────────────────────────────────────────
  const [started, setStarted] = useState(false)
  useEffect(() => {
    if (started) return
    setStarted(true)
    fetch("/api/reading", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "", spreadType: "three" }),
    })
      .then(r => { if (!r.ok) throw new Error(""); return r.json() })
      .then(data => {
        setCards(data.cards.map((c: any) => ({ ...c, revealed: false, interpretation: "", mantra: "" })))
        setReadingId(data.readingId)
        setStep("revealing")
      })
      .catch(() => setError("连接星象失败，请重试"))
  }, [started])

  // ── Reveal a card ───────────────────────────────────────────────
  const revealCard = useCallback((cardIndex: number) => {
    const updated = cards.map((c, i) => i === cardIndex ? { ...c, revealed: true } : c)
    setCards(updated)
    setCurrentCardIdx(cardIndex)
    setStep("interpreting")

    const card = updated[cardIndex]
    const elemMap: Record<string, string> = { "火": "行动与激情", "水": "情感与直觉", "风": "思维与沟通", "土": "稳固与现实" }
    const elemWord = elemMap[card.element] || "命运的流转"
    const posWord = card.position === "past" ? "过去位" : card.position === "present" ? "现在位" : "未来位"
    const interpretation = card.orientation === "正位"
      ? `${card.cardName}在${posWord}——正位的力量正在顺畅地流动。这张牌暗示着${elemWord}正在主导这个阶段。今天的能量偏向积极进取，适合做出决定。`
      : `${card.cardName}的逆位出现在${posWord}。逆位不是坏消息——它提醒你有些能量正在被压抑。${card.element === "火" ? "热情可能需要换个方向释放" : card.element === "水" ? "情绪或许需要一个出口" : card.element === "风" ? "想法可能需要重新整理" : card.element === "土" ? "根基可能需要在另一个方向重建" : "命运正在转弯"}。今天多给自己一点安静的时间。`

    const mantra = card.orientation === "正位" ? "顺势而行，不必强求。" : "有时候后退一步，是为了看清全貌。"

    setTimeout(() => {
      const final = [...cards]
      final[cardIndex] = { ...card, revealed: true, interpretation, mantra }
      setCards(final)
      if (cardIndex >= cards.length - 1) {
        doSynthesis(final)
      } else {
        setCurrentCardIdx(cardIndex + 1)
        setStep("revealing")
      }
    }, 600)
  }, [cards])

  // ── Synthesis ───────────────────────────────────────────────────
  const doSynthesis = useCallback((currentCards: CardData[]) => {
    setStep("synthesis")
    const reversedCount = currentCards.filter(c => c.orientation === "逆位").length
    const elements = currentCards.map(c => c.element)
    const fireCount = elements.filter(e => e === "火").length
    const waterCount = elements.filter(e => e === "水").length
    const windCount = elements.filter(e => e === "风").length
    const earthCount = elements.filter(e => e === "土").length
    const majorCount = elements.filter(e => !["火","水","风","土"].includes(e)).length

    let wuxing = "土"
    if (fireCount >= 2)            wuxing = "木"
    else if (waterCount >= 2)      wuxing = "火"
    else if (windCount >= 2)       wuxing = "金"
    else if (earthCount >= 2)      wuxing = "土"
    else if (reversedCount >= 2)   wuxing = "水"
    else if (fireCount === 1)      wuxing = "木"
    else if (waterCount === 1)     wuxing = "火"
    else if (windCount === 1)      wuxing = "金"
    else if (earthCount === 1)     wuxing = "土"
    else if (majorCount >= 1)      wuxing = "土"

    const c0 = currentCards[0] || { cardName: "?", orientation: "正位" as const }
    const c1 = currentCards[1] || { cardName: "?", orientation: "正位" as const }
    const c2 = currentCards[2] || { cardName: "?", orientation: "正位" as const }

    setSynthesisText(`${c0.cardName}在${c0.orientation === "正位" ? "顺流" : "提醒"}中指向你的过往——那段经历至今仍在塑造着你的选择。${c1.cardName}代表此刻的能量，${c1.orientation === "正位" ? "它正推动你向前" : "它在温柔地劝你慢下来"}。${c2.cardName}已经在地平线上展开了未来的可能——${c2.orientation === "正位" ? "那是一条清晰的路" : "那是一条藏在迷雾中的路，需要你多一分耐心"}。`)
    setSuggestions([
      c0.orientation === "正位" ? "把过去的经验当成指南，而非包袱。" : "有些旧事不需要现在解决——允许自己放一放。",
      "接下来的三天里，做一件你一直拖着的小事。不为什么，就是为了证明给自己看。",
      c2.orientation === "正位" ? "信任你第一直觉给的方向——那就是对的。" : "在迷雾中，最好的策略不是乱冲，是站定了等风来。",
    ])

    fetch("/api/reading/crystal-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cards: currentCards, question: "", profile }),
    })
      .then(r => r.json())
      .then(data => { setQuizData(data); setStep("profile") })
      .catch(() => { setQuizData(null); setStep("profile") })
  }, [profile])

  const finishQuiz = useCallback(() => {
    const counts: Record<string,number> = {}
    quizAnswers.forEach(a => { counts[a.wuxing] = (counts[a.wuxing]||0) + 1 })
    let wuxing = "土"; let max = 0
    for (const [k,v] of Object.entries(counts)) { if (v > max) { max = v; wuxing = k } }
    const crystal = crystalMap[wuxing] || { name: "白水晶", emoji: "✨" }
    setBlessing({
      wuxing,
      crystalName: crystal.name,
      affirmation: wuxing === "木" ? "我允许自己生长，以我的速度。"
        : wuxing === "火" ? "我的热情足够温暖自己，也能照亮别人。"
        : wuxing === "土" ? "我站得很稳。没有什么能动摇我。"
        : wuxing === "金" ? "清晰即力量。我知道自己在做什么。"
        : "我的平静比任何风暴都更有力量。",
    })
    setStep("blessing")
  }, [quizAnswers])

  const positionLabels: Record<string, string> = {
    past: "过去", present: "现在", future: "未来", current: "此刻",
  }

  // ── Loading state ───────────────────────────────────────────────
  if (step === "shuffle") {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70dvh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>
            牌正在为你洗牌...
          </p>
          {error && <div className="toast toast-info" style={{ position: 'relative', marginTop: 16, transform: 'none', left: 'auto' }}>{error}</div>}
        </div>
      </div>
    )
  }

  // ── Revealing / Interpreting — ONE card at a time, full screen ──
  if (step === "revealing" || step === "interpreting") {
    const card = cards[currentCardIdx]
    if (!card) return null
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100dvh',
        padding: 'env(safe-area-inset-top) 16px env(safe-area-inset-bottom)',
        paddingTop: 'max(40px, env(safe-area-inset-top))',
      }}>
        {/* Progress dots */}
        <ProgressDots current={cards.filter(c => c.revealed).length} total={cards.length} />

        {/* The card — touch to flip */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CardFlip
            card={card}
            positionLabel={positionLabels[card.position] || card.position}
            onReveal={() => revealCard(currentCardIdx)}
            disabled={step === "interpreting"}
          />
        </div>

        {/* Interpretation — slides up under the card */}
        {card.revealed && card.interpretation && (
          <div className="animate-fade-in-up" style={{
            padding: '14px 16px', fontSize: 14, lineHeight: 1.75,
            color: 'var(--text-primary)', maxWidth: 400, textAlign: 'center',
          }}>
            <p>{card.interpretation}</p>
            <p style={{
              marginTop: 12, fontWeight: 600,
              color: 'var(--gold-light)', fontFamily: 'var(--font-serif)', fontSize: 16,
            }}>
              ✦ {card.mantra}
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Synthesis + all cards together ─────────────────────────────
  if (step === "synthesis") {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: '100dvh', padding: 'max(40px, env(safe-area-inset-top)) 16px env(safe-area-inset-bottom)',
      }}>
        <ProgressDots current={3} total={3} />

        {/* Three revealed cards side by side */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {cards.map((card, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, color: 'var(--gold-light)', letterSpacing: '0.06em' }}>
                {positionLabels[card.position]} · {card.orientation}
              </div>
              <div style={{
                width: Math.min(100, Math.round((window.innerWidth - 80) / 3) - 8),
                height: Math.min(148, Math.round((window.innerWidth - 80) / 3 * 1.66)),
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                borderRadius: 6,
              }}>
                <CardFrame card={getCardById(card.cardId)} width={Math.min(100, Math.round((window.innerWidth - 80) / 3) - 8)} revealed />
              </div>
            </div>
          ))}
        </div>

        {/* Synthesis text */}
        <div className="animate-fade-in-up" style={{
          padding: '16px', maxWidth: 400, textAlign: 'center',
        }}>
          <div style={{
            fontSize: 11, color: 'var(--gold)', letterSpacing: '0.15em',
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            ✦ 牌面融通
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: 20 }}>
            {synthesisText}
          </p>
          {suggestions.length > 0 && (
            <div style={{
              padding: '14px 16px', background: 'rgba(201,149,74,0.06)',
              borderRadius: 12, marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, color: 'var(--gold-light)', marginBottom: 10, letterSpacing: '0.06em' }}>
                给你的建议
              </div>
              {suggestions.map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 6, paddingLeft: 14, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--gold)', fontWeight: 600 }}>{i + 1}.</span>{s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Profile — cards stay visible at top; skip if already saved ──
  if (step === "profile") {
    // If user already has data, jump straight to quiz
    if (alreadySaved && profileStep === 0) {
      // Schedule skip to next step
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          setStep("crystal_quiz")
          setQuizStep(0)
        }, 100)
      }
      // Show spinner while transitioning
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40dvh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>数据已保存，跳过...</div>
          </div>
        </div>
      )
    }

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: '100dvh', padding: 'max(32px, env(safe-area-inset-top)) 20px env(safe-area-inset-bottom)',
      }}>
        <ProgressDots current={3} total={3} />

        {/* Three small cards pinned at top */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {cards.map((card, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ fontSize: 9, color: 'var(--gold-light)', letterSpacing: '0.05em' }}>
                {positionLabels[card.position]} · {card.orientation}
              </div>
              <CardFrame card={getCardById(card.cardId)} width={70} revealed />
            </div>
          ))}
        </div>

        {/* Profile form below */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{
            fontSize: 14, color: 'var(--gold)', fontFamily: 'var(--font-display)',
            textAlign: 'center', marginBottom: 4, letterSpacing: '0.04em',
          }}>
            让我更了解你
          </div>
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28,
          }}>
            可以全部跳过，你的回答会让水晶匹配更准
          </div>

          {profileStep === 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>怎么称呼你？</div>
              <input className="input-field" placeholder="输入名字"
                value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                onKeyDown={e => { if (e.key === "Enter") setProfileStep(1) }}
                autoFocus maxLength={30}
                style={{ padding: '12px 14px', fontSize: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                <button className="btn-primary small" onClick={() => setProfileStep(1)}>下一题</button>
                <button className="btn-ghost" onClick={() => setProfileStep(1)}>跳过</button>
              </div>
            </div>
          )}

          {profileStep === 1 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>出生日期</div>
              <input className="input-field" type="date"
                value={profile.birthdate} onChange={e => setProfile({ ...profile, birthdate: e.target.value })}
                style={{ padding: '12px 14px', fontSize: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                <button className="btn-primary small" onClick={() => setProfileStep(2)}>下一题</button>
                <button className="btn-ghost" onClick={() => setProfileStep(2)}>跳过</button>
              </div>
            </div>
          )}

          {profileStep === 2 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.04em' }}>性别</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {["女","男","非二元","不想说"].map(g => (
                  <button key={g}
                    onClick={() => setProfile({ ...profile, gender: g })}
                    className={profile.gender === g ? "tag" : "tag"}
                    style={{
                      padding: '10px 20px', fontSize: 15,
                      border: profile.gender === g ? '1px solid var(--border-focus)' : '1px solid var(--border)',
                      background: profile.gender === g ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      color: profile.gender === g ? 'var(--gold-light)' : 'var(--text-secondary)',
                    }}>
                    {g}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                <button className="btn-primary small" onClick={() => setProfileStep(3)}>下一题</button>
                <button className="btn-ghost" onClick={() => setProfileStep(3)}>跳过</button>
              </div>
            </div>
          )}

          {profileStep === 3 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.04em' }}>身份</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {["工作","待业","学生","自由职业"].map(o => (
                  <button key={o}
                    onClick={() => setProfile({ ...profile, occupation: o })}
                    className="tag"
                    style={{
                      padding: '10px 20px', fontSize: 15,
                      border: profile.occupation === o ? '1px solid var(--border-focus)' : '1px solid var(--border)',
                      background: profile.occupation === o ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      color: profile.occupation === o ? 'var(--gold-light)' : 'var(--text-secondary)',
                    }}>
                    {o}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
                <button className="btn-primary"
                  onClick={async () => {
                    // Save profile once on final step — server + local cache
                    const fields = {
                      nickname: profile.name || undefined,
                      birthday: profile.birthdate || undefined,
                      gender: profile.gender || undefined,
                      occupation: profile.occupation || undefined,
                    }
                    cacheProfile({ nickname: profile.name, birthday: profile.birthdate, gender: profile.gender, occupation: profile.occupation })
                    await saveProfile(fields)
                    setStep("crystal_quiz"); setQuizStep(0)
                  }}>
                  {profile.name ? `${profile.name} — 继续` : "继续选水晶"}
                </button>
                <button className="btn-ghost"
                  onClick={() => { setStep("crystal_quiz"); setQuizStep(0) }}>
                  跳过
                </button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: 'var(--text-muted)' }}>
            {profileStep < 3 ? `${profileStep + 1}/4` : "最后一步"}
          </div>
        </div>
      </div>
    )
  }

  // ── Crystal Quiz — cards stay visible at top ────────────────────
  if (step === "crystal_quiz") {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: '100dvh', padding: 'max(32px, env(safe-area-inset-top)) 20px env(safe-area-inset-bottom)',
      }}>
        <ProgressDots current={3} total={3} />

        {/* Three small cards pinned at top */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {cards.map((card, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ fontSize: 9, color: 'var(--gold-light)', letterSpacing: '0.05em' }}>
                {positionLabels[card.position]} · {card.orientation}
              </div>
              <CardFrame card={getCardById(card.cardId)} width={70} revealed />
            </div>
          ))}
        </div>

        {/* Quiz below */}
        <div style={{ width: '100%', maxWidth: 360 }}>
          {!quizData ? (
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 20px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>
                牌正在为你准备问题...
              </p>
            </div>
          ) : (
            <>
              {quizData.questions.map((q, qi) => (
                quizStep === qi ? (
                  <div key={qi} className="animate-fade-in">
                    <div style={{
                      fontSize: 16, fontWeight: 600, color: 'var(--text-primary)',
                      marginBottom: 24, fontFamily: 'var(--font-serif)',
                      textAlign: 'center', lineHeight: 1.5,
                    }}>
                      {q.question}
                    </div>
                    {q.options.map((opt, oi) => (
                      <button key={oi}
                        onClick={() => {
                          const newAnswers = [...quizAnswers, {wuxing: opt.wuxing, label: opt.label}]
                          setQuizAnswers(newAnswers)
                          if (qi + 1 >= quizData!.questions.length) {
                            setQuizStep(qi + 1)
                            setTimeout(finishQuiz, 50)
                          } else {
                            setQuizStep(qi + 1)
                          }
                        }}
                        style={{
                          display: 'block', width: '100%', marginBottom: 10,
                          padding: '14px 16px', fontSize: 15, textAlign: 'left',
                          background: 'var(--bg-card)', border: '1px solid var(--border)',
                          borderRadius: 12, color: 'var(--text-primary)',
                          cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          WebkitTapHighlightColor: 'transparent',
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null
              ))}
              {quizStep >= (quizData?.questions?.length || 0) && (
                <div style={{ textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto 20px' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>
                    水晶正在回应你的选择...
                  </p>
                </div>
              )}
            </>
          )}

          {quizData && quizStep < quizData.questions.length && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'var(--text-muted)' }}>
              {quizStep + 1}/{quizData.questions.length}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Blessing — final reveal ─────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100dvh', padding: 'max(40px, env(safe-area-inset-top)) 20px env(safe-area-inset-bottom)',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-in-up">
        {/* Three cards summary */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
          {cards.map((card, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ fontSize: 9, color: 'var(--gold-light)', letterSpacing: '0.05em' }}>
                {positionLabels[card.position]} · {card.orientation}
              </div>
              <CardFrame card={getCardById(card.cardId)} width={80} revealed />
            </div>
          ))}
        </div>

        {/* Synthesis */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, color: 'var(--gold)', letterSpacing: '0.15em',
            textTransform: 'uppercase', textAlign: 'center', marginBottom: 12,
          }}>
            ✦ 牌面融通
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', textAlign: 'center' }}>
            {synthesisText}
          </p>
        </div>

        {blessing && (
          <div className="crystal-card" style={{ marginBottom: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              你的能量此刻需要
            </div>
            <div style={{
              fontSize: 22, fontWeight: 600, color: 'var(--gold-light)',
              fontFamily: 'var(--font-serif)', marginBottom: 16,
            }}>
              {crystalMap[blessing.wuxing]?.emoji} 一点{crystalMap[blessing.wuxing]?.name}的力量
            </div>
            <Link href={`/crystal/${blessing.wuxing}`}
              className="btn-outline"
              style={{ display: 'inline-flex', justifyContent: 'center', textDecoration: 'none', marginBottom: 16 }}>
              查看水晶详情
            </Link>
            <div style={{
              fontSize: 17, fontWeight: 500, color: 'var(--gold-light)',
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            }}>
              "{blessing.affirmation}"
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/temple" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            🛐 请守护神加持
          </Link>
        </div>
      </div>
    </div>
  )
}
