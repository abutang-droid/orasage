"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

type MeritSummary = {
  total: number
  levelTitleZh: string
  levelTitleEn: string
  streak: number
  streakLongest: number
  rank: string
  progressInLevel: number
  neededForNext: number | null
  meritTime: number
  meritShare: number
  meritOffer: number
}

type Checkin = {
  deityName: string
  worshipStage: number
  meritEarned: number
  checkinDate: string
}

export default function MeritPage() {
  const [summary, setSummary] = useState<MeritSummary | null>(null)
  const [recent, setRecent] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/merit")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setSummary(data?.summary ?? null)
        setRecent(data?.recentCheckins ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        加载功德…
      </div>
    )
  }

  const s = summary ?? {
    total: 0,
    levelTitleZh: '朝圣者',
    levelTitleEn: 'Pilgrim',
    streak: 0,
    streakLongest: 0,
    rank: '0/100',
    progressInLevel: 0,
    neededForNext: 100,
    meritTime: 0,
    meritShare: 0,
    meritOffer: 0,
  }

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 24, paddingBottom: 32 }}>
        <Link href="/profile" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>← 返回我的</Link>

        <div style={{ textAlign: 'center', padding: '28px 0 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 4 }}>{s.levelTitleZh}</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.levelTitleEn}</p>
        </div>

        <div className="card-gold" style={{ padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>总功德</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--gold-light)', fontFamily: 'var(--font-mono)' }}>{s.total}</div>
          <div style={{ marginTop: 12, height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round(s.progressInLevel * 100)}%`, height: '100%', background: 'var(--gold)' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            {s.neededForNext != null ? `距离下一阶还差 ${s.neededForNext} 功德` : '已达最高阶'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
          {[
            { label: '时间功德', value: s.meritTime },
            { label: '传播功德', value: s.meritShare },
            { label: '供养功德', value: s.meritOffer },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--gold-light)' }}>{item.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          连续参拜 {s.streak} 天 · 最长 {s.streakLongest} 天
        </div>

        <div className="section-label" style={{ marginBottom: 10 }}>最近参拜</div>
        {recent.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0' }}>
            还没有参拜记录，去 <Link href="/temple" style={{ color: 'var(--gold-light)' }}>每日拜神</Link> 开始积累功德。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map((c) => (
              <div key={`${c.checkinDate}-${c.deityName}`} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{c.deityName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.checkinDate}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--gold-light)' }}>+{c.meritEarned}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
