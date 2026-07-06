"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useLang } from "@/lib/i18n/context"
import { profileUrlFromLang } from "@/lib/orasage-locale"
import "./merit.css"

type MeritSummary = {
  total: number
  level: number
  levelTitleZh: string
  levelTitleEn: string
  levelTitlePt: string
  streak: number
  streakLongest: number
  totalCheckins: number
  totalSpentCents: number
  rank: string
  progressInLevel: number
  neededForNext: number | null
  meritTime: number
  meritShare: number
  meritOffer: number
  sharePathEnabled: boolean
}

type MeritRuleRow = {
  condition: string
  amount: string
  note?: string
}

type MeritRules = {
  sharePathEnabled: boolean
  sacredDayMultiplier: number
  levels: Array<{
    level: number
    min: number
    max: number | null
    titleZh: string
    titleEn: string
    titlePt: string
    privileges: { leaderboard: boolean; unlocksZh: string[] }
  }>
  time: {
    label: string
    active: boolean
    rules: MeritRuleRow[]
    interruptNote?: string
  }
  share: {
    label: string
    active: boolean
    pausedNote?: string
    rules: MeritRuleRow[]
  }
  offer: {
    label: string
    active: boolean
    rules: MeritRuleRow[]
  }
}

type Checkin = {
  deityName: string
  worshipStage: number
  meritEarned: number
  checkinDate: string
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function PathRulesCard({
  name,
  active,
  pausedNote,
  rules,
  interruptNote,
}: {
  name: string
  active: boolean
  pausedNote?: string
  rules: MeritRuleRow[]
  interruptNote?: string
}) {
  return (
    <div className={`merit-rules-card${active ? "" : " is-paused"}`}>
      <div className="merit-rules-header">
        <span className="merit-rules-name">{name}</span>
        <span className={`merit-rules-badge${active ? "" : " is-paused"}`}>
          {active ? "进行中" : "已暂停"}
        </span>
      </div>
      {!active && pausedNote && (
        <p className="merit-rule-note" style={{ marginBottom: 10 }}>{pausedNote}</p>
      )}
      {rules.map((rule) => (
        <div key={rule.condition} className="merit-rule-row">
          <div>
            <div className="merit-rule-condition">{rule.condition}</div>
            {rule.note && <div className="merit-rule-note">{rule.note}</div>}
          </div>
          <div className="merit-rule-amount">{rule.amount}</div>
        </div>
      ))}
      {interruptNote && (
        <p className="merit-rule-note" style={{ marginTop: 8 }}>{interruptNote}</p>
      )}
    </div>
  )
}

export default function MeritPage() {
  const { lang } = useLang()
  const profileHref = profileUrlFromLang(lang)
  const [summary, setSummary] = useState<MeritSummary | null>(null)
  const [rules, setRules] = useState<MeritRules | null>(null)
  const [recent, setRecent] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/merit")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setSummary(data?.summary ?? null)
        setRules(data?.rules ?? null)
        setRecent(data?.recentCheckins ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="merit-page" style={{ paddingTop: 48, textAlign: "center", color: "var(--text-muted)" }}>
        加载功德…
      </div>
    )
  }

  const s = summary ?? {
    total: 0,
    level: 0,
    levelTitleZh: "朝圣者",
    levelTitleEn: "Pilgrim",
    levelTitlePt: "Peregrino",
    streak: 0,
    streakLongest: 0,
    totalCheckins: 0,
    totalSpentCents: 0,
    rank: "0/100",
    progressInLevel: 0,
    neededForNext: 100,
    meritTime: 0,
    meritShare: 0,
    meritOffer: 0,
    sharePathEnabled: false,
  }

  const levelRules = rules?.levels ?? []

  return (
    <div className="merit-page">
      <div style={{ paddingTop: 24 }}>
        <a href={profileHref} style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
          ← 返回用户中心
        </a>

        <div className="merit-hero">
          <div className="merit-badge">✦</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4 }}>{s.levelTitleZh}</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {s.levelTitleEn} · {s.levelTitlePt}
          </p>
        </div>

        <div className="merit-total-card card-gold">
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>总功德</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: "var(--gold-light)", fontFamily: "var(--font-mono)" }}>
            {s.total}
          </div>
          <div className="merit-progress-track">
            <div className="merit-progress-fill" style={{ width: `${Math.round(s.progressInLevel * 100)}%` }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
            {s.rank}
            {s.neededForNext != null ? ` · 距离下一阶还差 ${s.neededForNext} 功德` : " · 已达最高阶"}
          </div>
        </div>

        <div className="merit-path-grid">
          <div className="merit-path-card is-time">
            <div className="merit-path-value">{s.meritTime}</div>
            <div className="merit-path-label">⏳ 时间功德</div>
            <div className="merit-path-meta">
              每日参拜 {s.totalCheckins} 天
              <br />
              连续 {s.streak} 天 · 最长 {s.streakLongest} 天
            </div>
          </div>
          <div className="merit-path-card is-offer">
            <div className="merit-path-value">{s.meritOffer}</div>
            <div className="merit-path-label">💰 供养功德</div>
            <div className="merit-path-meta">累计消费 {formatUsd(s.totalSpentCents)}</div>
          </div>
        </div>

        {s.meritShare > 0 && (
          <div className="merit-path-card is-share is-paused" style={{ marginBottom: 20 }}>
            <div className="merit-path-value">{s.meritShare}</div>
            <div className="merit-path-label">📤 传播功德（历史）</div>
            <div className="merit-path-meta">
              {s.sharePathEnabled ? "推荐奖励进行中" : "分享路径已暂停，历史功德仍计入总数"}
            </div>
          </div>
        )}

        {rules && (
          <div className="merit-sacred-note">
            神圣日（初一/十五、元旦、圣诞等）所有功德 ×{rules.sacredDayMultiplier}。阶位只升不降。
          </div>
        )}

        {rules && (
          <div className="merit-section">
            <div className="merit-section-title">功德规则</div>
            <PathRulesCard
              name={rules.time.label}
              active={rules.time.active}
              rules={rules.time.rules}
              interruptNote={rules.time.interruptNote}
            />
            <PathRulesCard
              name={rules.offer.label}
              active={rules.offer.active}
              rules={rules.offer.rules}
            />
            <PathRulesCard
              name={rules.share.label}
              active={rules.share.active}
              pausedNote={rules.share.pausedNote}
              rules={rules.share.rules}
            />
          </div>
        )}

        {levelRules.length > 0 && (
          <div className="merit-section">
            <div className="merit-section-title">阶位与权限</div>
            {levelRules.map((lvl) => (
              <div
                key={lvl.level}
                className={`merit-privilege-card${lvl.level === s.level ? " is-current" : ""}`}
              >
                <div className="merit-privilege-title">
                  {lvl.titleZh} · {lvl.titlePt}
                  {lvl.level === s.level && (
                    <span style={{ fontSize: 10, color: "var(--gold-light)", marginLeft: 8 }}>当前</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>
                  {lvl.min}–{lvl.max ?? "∞"} 功德
                  {lvl.privileges.leaderboard ? " · 功德榜可见" : " · 功德榜不可见"}
                </div>
                <ul className="merit-privilege-list">
                  {lvl.privileges.unlocksZh.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="merit-section">
          <div className="merit-section-title">最近参拜</div>
          {recent.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 0" }}>
              还没有参拜记录，去{" "}
              <Link href="/temple" style={{ color: "var(--gold-light)" }}>
                每日拜神
              </Link>{" "}
              开始积累功德。
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recent.map((c) => (
                <div key={`${c.checkinDate}-${c.deityName}`} className="merit-checkin-row">
                  <div>
                    <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{c.deityName}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.checkinDate}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gold-light)" }}>+{c.meritEarned}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
