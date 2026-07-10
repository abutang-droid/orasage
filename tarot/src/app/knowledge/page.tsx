"use client"
import { useState, useEffect } from "react"
import { useKnowledgeCopy } from "@/lib/i18n/feature-copy"

export default function KnowledgePage() {
  const copy = useKnowledgeCopy()
  const [tip, setTip] = useState<{ title: string; content: string; category?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/knowledge")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setTip(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{copy.loading}</div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>

      <div className="page-header animate-fade-in-up">
        <span className="label">{copy.label}</span>
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      {tip && (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--gold-subtle) 0%, var(--bg-card) 100%)',
            border: '1px solid rgba(201,149,74,0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-gold)',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(201,149,74,0.12)',
                border: '1px solid rgba(201,149,74,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: 'var(--gold)',
              }}>✦</div>
              <span className="section-label">{copy.todayLabel}</span>
            </div>

            <h2 style={{
              fontSize: 20, fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              marginBottom: 16, lineHeight: 1.4,
            }}>
              {tip.title}
            </h2>

            <div className="divider" style={{ margin: '0 0 16px' }} />

            <div style={{
              fontSize: 14, color: 'var(--text-secondary)',
              lineHeight: 1.9,
            }}>
              {tip.content}
            </div>
          </div>

          {tip.category && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span className="tag">{tip.category}</span>
            </div>
          )}
        </div>
      )}

      {!tip && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>📖</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{copy.emptyTitle}</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{copy.emptyHint}</div>
        </div>
      )}

      <p style={{
        textAlign: 'center', fontSize: 11,
        color: 'var(--text-faint)',
        padding: '20px 0 8px',
        letterSpacing: '0.04em',
      }}>
        {copy.footer}
      </p>
    </div>
  )
}
