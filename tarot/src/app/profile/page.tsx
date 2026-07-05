"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@/lib/user"
import { profileReadingsUrl } from "@/lib/profile-readings-url"

type MeritSummary = {
  total: number
  levelTitleZh: string
  levelTitleEn: string
  streak: number
  rank: string
  progressInLevel: number
  neededForNext: number | null
  meritTime: number
  meritShare: number
  meritOffer: number
  prayedToday: boolean
}

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser()
  const [summary, setSummary] = useState<MeritSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/merit")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setSummary(data?.summary ?? null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [user?.id])

  const levelTitle = summary?.levelTitleZh ?? "朝圣者"
  const levelEN = summary?.levelTitleEn ?? "Pilgrim"
  const total = summary?.total ?? user?.meritTotal ?? 0
  const streak = summary?.streak ?? user?.streakDays ?? 0
  const rank = summary?.rank ?? `${total}/100`

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 32 }}>
        <div style={{ textAlign: 'center', padding: '24px 0' }} className="animate-fade-in-up">
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(160deg, var(--gold-dark), var(--gold-light))',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, color: '#0D0D0D', boxShadow: 'var(--shadow-gold)',
          }}>✦</div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            {userLoading || loading ? '…' : levelTitle}
          </h2>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {levelEN} · 功德 {total}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }} className="animate-fade-in-up delay-100">
          {[
            { label: "连续参拜", value: `${streak}天` },
            { label: "阶位进度", value: rank },
            { label: "今日参拜", value: summary?.prayedToday ? "已完成" : "未参拜" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', padding: '14px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--gold-light)', fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 }}>
          {[
            { href: profileReadingsUrl(), emoji: "🔮", label: "占卜记录", external: true },
            { href: "/temple", emoji: "🛐", label: "拜神记录" },
            { href: "/crystal", emoji: "📿", label: "我的水晶" },
            { href: "/profile/merit", emoji: "✨", label: "功德详情" },
            { href: "/profile/settings", emoji: "⚙️", label: "设置" },
          ].map(item => (
            item.external ? (
              <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                  <span style={{ fontSize: 18 }}>{item.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
                </div>
              </a>
            ) : (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'all 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-focus)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                <span style={{ fontSize: 18 }}>{item.emoji}</span>
                <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{item.label}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
              </div>
            </Link>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
