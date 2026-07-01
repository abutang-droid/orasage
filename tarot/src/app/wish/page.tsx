"use client"
import { useState } from "react"

const CONCLUSIONS: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  "可行": { label: "可行",  color: "var(--green)",  bg: "var(--green-pale)",  desc: "星象支持，时机已到" },
  "蓄力": { label: "蓄力",  color: "var(--gold)",   bg: "var(--gold-pale)",   desc: "积累能量，静待时机" },
  "暂缓": { label: "暂缓",  color: "var(--rose)",   bg: "var(--rose-pale)",   desc: "星象提示，需要耐心" },
}

export default function WishPage() {
  const [wish, setWish] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!wish.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wish: wish.trim() }),
      })
      if (res.ok) setResult(await res.json())
    } catch (e) {}
    finally { setLoading(false) }
  }

  const conclusionInfo = result ? (CONCLUSIONS[result.conclusion] || { label: result.conclusion, color: 'var(--gold)', bg: 'var(--gold-pale)', desc: '' }) : null

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>

      {/* ── Header ── */}
      <div className="page-header animate-fade-in-up">
        <span className="label">WISH DIVINATION</span>
        <h1>心愿占卜</h1>
        <p>写下心愿，获取塔罗指引</p>
      </div>

      {/* ── Input Card ── */}
      <div className="animate-fade-in-up" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '22px',
        marginBottom: 16,
        boxShadow: 'var(--shadow-sm)',
        animationDelay: '0.1s',
      }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{
            display: 'block', fontSize: 12,
            color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500,
          }}>
            你的心愿
          </label>
          <textarea
            value={wish}
            onChange={e => setWish(e.target.value)}
            placeholder="写下一个简短的心愿，例如：希望这段感情顺利…"
            className="input-field"
            rows={4}
            maxLength={200}
          />
          <div style={{
            textAlign: 'right', fontSize: 11,
            color: 'var(--text-faint)', marginTop: 4,
          }}>
            {wish.length}/200
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !wish.trim()}
          className="btn-primary"
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 1.5 }} />
              <span>占卜中…</span>
            </>
          ) : (
            "✦ 一键占卜"
          )}
        </button>
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Card drawn */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center',
          }}>
            <div className="section-label" style={{ marginBottom: 10 }}>抽到的牌</div>
            <div style={{
              fontSize: 20, fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              marginBottom: 4,
            }}>
              {result.cardName}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 500,
              color: result.orientation === '正位' ? 'var(--green)' : 'var(--rose)',
              background: result.orientation === '正位' ? 'var(--green-pale)' : 'var(--rose-pale)',
              padding: '2px 12px', borderRadius: 20,
              display: 'inline-block',
            }}>
              {result.orientation === '正位' ? '↑ 正位' : '↓ 逆位'}
            </div>
          </div>

          {/* Conclusion */}
          {conclusionInfo && (
            <div style={{
              background: conclusionInfo.bg,
              border: `1px solid ${conclusionInfo.color}30`,
              borderRadius: 'var(--radius-lg)',
              padding: '22px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                fontSize: 36, fontWeight: 700,
                color: conclusionInfo.color,
                fontFamily: 'var(--font-serif)',
                marginBottom: 4,
              }}>
                {conclusionInfo.label}
              </div>
              <div style={{ fontSize: 12, color: conclusionInfo.color, opacity: 0.7, marginBottom: 14 }}>
                {conclusionInfo.desc}
              </div>
              <div className="divider" style={{ margin: '14px 0' }} />
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85 }}>
                {result.advice}
              </div>
            </div>
          )}

          {/* Wish recap */}
          <div style={{
            background: 'var(--gold-subtle)',
            border: '1px solid rgba(201,149,74,0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 14, color: 'var(--gold)', flexShrink: 0 }}>💫</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}>
              「{wish}」
            </span>
          </div>

          {/* Reset */}
          <button
            className="btn-outline"
            onClick={() => { setResult(null); setWish("") }}
            style={{ width: '100%' }}
          >
            再次占卜
          </button>
        </div>
      )}
    </div>
  )
}
