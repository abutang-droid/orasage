"use client"
import { useState, useEffect } from "react"

const DIMS = [
  { key: "love",   label: "爱情", symbol: "♀", color: "var(--rose)",   bg: "var(--rose-pale)" },
  { key: "work",   label: "事业", symbol: "♂", color: "var(--blue)",   bg: "var(--blue-pale)" },
  { key: "wealth", label: "财运", symbol: "◎", color: "var(--gold)",   bg: "var(--gold-pale)" },
  { key: "mood",   label: "心情", symbol: "☽", color: "var(--purple)", bg: "var(--purple-pale)" },
]

export default function FortunePage() {
  const [fortune, setFortune] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/fortune")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setFortune(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>生成今日日运…</div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>

      {/* ── Header ── */}
      <div className="page-header animate-fade-in-up">
        <span className="label">DAILY FORTUNE</span>
        <h1>日运播报</h1>
        <p>今日四大能量维度</p>
      </div>

      {/* ── Fortune Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DIMS.map((dim, idx) => {
          const d = fortune?.[dim.key]
          return (
            <div
              key={dim.key}
              className="animate-fade-in-up"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${dim.color}`,
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                boxShadow: 'var(--shadow-sm)',
                animationDelay: `${idx * 0.08}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: dim.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: dim.color,
                    fontFamily: 'var(--font-serif)',
                  }}>
                    {dim.symbol}
                  </div>
                  <span style={{
                    fontSize: 15, fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)',
                  }}>
                    {dim.label}
                  </span>
                </div>
                {d?.tag ? (
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    padding: '3px 12px', borderRadius: 20,
                    background: dim.bg, color: dim.color,
                  }}>
                    {d.tag}
                  </span>
                ) : (
                  <div className="skeleton" style={{ height: 22, width: 56 }} />
                )}
              </div>

              {d?.text ? (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85 }}>
                  {d.text}
                </div>
              ) : (
                <div>
                  <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: '70%' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Footer note ── */}
      <p style={{
        textAlign: 'center', fontSize: 11,
        color: 'var(--text-faint)',
        padding: '20px 0 8px',
        letterSpacing: '0.04em',
      }}>
        日运每日更新 · 明早再来
      </p>
    </div>
  )
}
