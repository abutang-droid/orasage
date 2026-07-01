"use client"
import { useState, useEffect } from "react"
import TarotCard from "@/components/TarotCard"
import { ALL_CARDS } from "@/lib/tarot/cards"

export default function DailyCardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    fetch("/api/daily-card")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setData(d)
        setLoading(false)
        if (d?.alreadyDrew) {
          setTimeout(() => { setFlipped(true); setRevealed(true) }, 400)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true)
      setTimeout(() => setRevealed(true), 500)
    }
  }

  const cardMeta = data?.cardName ? ALL_CARDS.find(c => c.name === data.cardName) : null

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>抽取今日灵卡…</div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>

      {/* ── Header ── */}
      <div className="page-header animate-fade-in-up">
        <span className="label">DAILY CARD</span>
        <h1>每日抽卡</h1>
        <p>{data?.alreadyDrew ? "这是你今天抽到的牌" : "点击卡牌翻转，接收今日讯息"}</p>
      </div>

      {/* ── Card ── */}
      <div
        className="animate-scale-in"
        style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}
        onClick={handleFlip}
      >
        <div style={{
          animation: flipped ? 'none' : 'float 3.5s ease-in-out infinite',
          cursor: flipped ? 'default' : 'pointer',
          filter: flipped ? 'none' : 'drop-shadow(0 8px 24px rgba(201,149,74,0.2))',
        }}>
          <TarotCard
            name={data?.cardName || ""}
            nameEn={cardMeta?.nameEn}
            orientation={data?.orientation || "正位"}
            keywords={cardMeta?.keywords?.join("·")}
            flipped={flipped}
            arcana={cardMeta?.arcana}
            suit={cardMeta?.suit}
            number={cardMeta?.number}
            symbol={cardMeta?.symbol || "fool"}
            glowing={!flipped}
          />
        </div>
      </div>

      {/* ── Result ── */}
      {revealed && data && (
        <div className="animate-fade-in-up" style={{ textAlign: 'left' }}>

          {/* Card info */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px',
            marginBottom: 12,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              {data.cardType && (
                <span className="tag">{data.cardType}</span>
              )}
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: data.orientation === '正位' ? 'var(--green)' : 'var(--rose)',
                background: data.orientation === '正位' ? 'var(--green-pale)' : 'var(--rose-pale)',
                padding: '2px 10px', borderRadius: 20,
              }}>
                {data.orientation === '正位' ? '↑ 正位' : '↓ 逆位'}
              </span>
            </div>

            <div style={{
              fontSize: 22, fontFamily: 'var(--font-serif)',
              fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4,
            }}>
              {data.cardName}
            </div>
            {cardMeta?.nameEn && (
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                letterSpacing: '0.08em', fontFamily: 'var(--font-display)', marginBottom: 14,
              }}>
                {cardMeta.nameEn}
              </div>
            )}

            {cardMeta?.keywords && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {cardMeta.keywords.map(kw => (
                  <span key={kw} className="tag">{kw}</span>
                ))}
              </div>
            )}

            <div className="divider" style={{ margin: '14px 0' }} />

            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85 }}>
              {data.message}
            </div>
          </div>

          {/* Lucky tip */}
          {data.luckyTip && (
            <div style={{
              background: 'linear-gradient(135deg, var(--gold-subtle), var(--bg-card))',
              border: '1px solid rgba(201,149,74,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              marginBottom: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '1px solid rgba(201,149,74,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, background: 'rgba(201,149,74,0.08)',
              }}>
                <span style={{ fontSize: 11, color: 'var(--gold)' }}>✦</span>
              </div>
              <div>
                <div className="section-label" style={{ marginBottom: 5 }}>今日幸运提示</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                  {data.luckyTip}
                </div>
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', letterSpacing: '0.06em', padding: '8px 0' }}>
            每日仅限抽取一次
          </p>
        </div>
      )}

      {!flipped && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 20 }}>
          轻触卡牌，开启今日指引
        </p>
      )}
    </div>
  )
}
