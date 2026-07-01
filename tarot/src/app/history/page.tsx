"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

type TabType = "reading" | "daily-card" | "wish"

const TABS = [
  { key: "reading" as TabType,    label: "牌阵占卜" },
  { key: "daily-card" as TabType, label: "每日抽卡" },
  { key: "wish" as TabType,       label: "心愿占卜" },
]

function fmt(s: string) {
  const d = new Date(s)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function HistoryContent() {
  const searchParams = useSearchParams()
  // Support ?tab=xxx to jump to specific tab (fixes history redirect bug)
  const defaultTab = (searchParams.get("tab") as TabType) || "reading"
  const [tab, setTab] = useState<TabType>(defaultTab)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setData(null)
    fetch(`/api/history?type=${tab}&page=${page}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [tab, page])

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>

      {/* ── Header ── */}
      <div className="page-header animate-fade-in-up">
        <span className="label">ARCHIVE</span>
        <h1>历史记录</h1>
        <p>回顾你的占卜档案</p>
      </div>

      {/* ── Tab Bar ── */}
      <div className="tab-bar animate-fade-in-up" style={{ marginBottom: 20, animationDelay: '0.1s' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-item${tab === t.key ? ' active' : ''}`}
            onClick={() => { setTab(t.key); setPage(1) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div className="spinner" />
        </div>
      )}

      {!loading && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Empty state */}
          {data.records?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◈</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>暂无记录</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>开始你的第一次占卜吧</div>
            </div>
          )}

          {/* Reading records */}
          {tab === "reading" && data.records?.map((r: any, i: number) => (
            <div
              key={r.id}
              className="animate-fade-in-up"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow-sm)',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                  flex: 1, marginRight: 8,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {r.question || "占卜"}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>
                  {fmt(r.createdAt)}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {(r.cards as any[])?.map((c: any, j: number) => (
                  <span key={j} className="tag">{c.cardName}</span>
                ))}
              </div>
              {r.conclusion && (
                <div style={{
                  fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {r.conclusion}
                </div>
              )}
              {r.crystalName && (
                <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>✦</span> 推荐水晶：{r.crystalName}
                </div>
              )}
            </div>
          ))}

          {/* Daily card records */}
          {tab === "daily-card" && data.records?.map((r: any, i: number) => (
            <div
              key={r.id}
              className="animate-fade-in-up"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow-sm)',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.cardType && <span className="tag">{r.cardType}</span>}
                  <span style={{
                    fontSize: 15, fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)',
                  }}>
                    {r.cardName}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{fmt(r.createdAt)}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {r.message}
              </div>
            </div>
          ))}

          {/* Wish records */}
          {tab === "wish" && data.records?.map((r: any, i: number) => (
            <div
              key={r.id}
              className="animate-fade-in-up"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow-sm)',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>心愿占卜</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{fmt(r.createdAt)}</div>
              </div>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-serif)',
                marginBottom: 8,
              }}>
                「{r.wish}」
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.cardName}</span>
                {r.conclusion && (
                  <span className="tag">{r.conclusion}</span>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 16 }}>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13, fontWeight: 500,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: p === page ? 'var(--gold)' : 'var(--bg-card)',
                    color: p === page ? '#fff' : 'var(--text-secondary)',
                    borderColor: p === page ? 'var(--gold)' : 'var(--border)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner" />
      </div>
    }>
      <HistoryContent />
    </Suspense>
  )
}
