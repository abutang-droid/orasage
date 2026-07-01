"use client"
import { useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import TopHeader from "@/components/TopHeader"
import { useT } from "@/lib/i18n/context"

// ─── Starfield Canvas ─────────────────────────────────────────────
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const stars: { x: number; y: number; r: number; opacity: number; speed: number; hue: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.3 + 0.1,
        hue: Math.random() > 0.5 ? 40 : 260,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const star of stars) {
        star.y -= star.speed
        star.opacity += (Math.random() - 0.5) * 0.01
        star.opacity = Math.max(0.05, Math.min(0.6, star.opacity))
        if (star.y < -10) { star.y = canvas.height + 10; star.x = Math.random() * canvas.width }
        const color = star.hue === 40
          ? `rgba(201,149,74,${star.opacity})`
          : `rgba(126,111,168,${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  return <canvas ref={canvasRef} className="star-canvas" aria-hidden="true" />
}

// ─── Icons ────────────────────────────────────────────────────────
const MoonIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="rgba(212,168,83,0.12)" />
  </svg>
)
const CompassStar = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E9C877" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" opacity="0.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" opacity="0.6" />
    <path d="M12 5l1.8 4.6L18 11l-4.2 1.4L12 17l-1.8-4.6L6 11l4.2-1.4L12 5z" fill="rgba(233,200,119,0.18)" />
  </svg>
)
const SunIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.2" fill="rgba(212,168,83,0.15)" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
  </svg>
)
const ThinkIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.2 1 2.5h6c0-1.3.3-1.8 1-2.5A6 6 0 0 0 12 3z" fill="rgba(201,149,74,0.1)" />
  </svg>
)
const ChooseIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="4" width="10" height="14" rx="1.5" fill="rgba(201,149,74,0.1)" />
    <path d="M5 7v11a1.5 1.5 0 0 0 1.5 1.5H15" opacity="0.7" />
  </svg>
)
const ReadIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" fill="rgba(201,149,74,0.08)" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
)
const HeartIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5 6 5c2 0 3 1.2 4 2.5C11 6.2 12 5 14 5c3.5 0 5 3.5 3.5 6.5C19 15.65 12 20 12 20z" fill="rgba(200,123,110,0.12)" />
  </svg>
)
const BriefcaseIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="2" fill="rgba(201,149,74,0.1)" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
  </svg>
)
const DiamondIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l3 6-9 12L3 9l3-6z" fill="rgba(126,111,168,0.12)" />
    <path d="M3 9h18M9 3l-1 6 4 12 4-12-1-6" opacity="0.7" />
  </svg>
)
const LotusIcon = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4c1.8 2 2.5 4.2 2.5 7 0 1.5-1 3-2.5 3s-2.5-1.5-2.5-3c0-2.8.7-5 2.5-7z" fill="rgba(91,140,90,0.14)" />
    <path d="M12 14c-2 0-4-1-5.5-3 .2 3.5 2.5 6 5.5 6s5.3-2.5 5.5-6c-1.5 2-3.5 3-5.5 3z" />
  </svg>
)
const HandsHeartIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 7.5C13 6 14 5.3 15.3 5.3c1.9 0 3.2 1.5 3.2 3.4 0 2.6-3.5 4.8-6.5 6.8-3-2-6.5-4.2-6.5-6.8 0-1.9 1.3-3.4 3.2-3.4C10 5.3 11 6 12 7.5z" fill="rgba(201,149,74,0.12)" />
    <path d="M4 20c1.5-1.5 3-2 5-2M20 20c-1.5-1.5-3-2-5-2" opacity="0.7" />
  </svg>
)
const CompassIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" fill="rgba(201,149,74,0.06)" />
    <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" fill="rgba(201,149,74,0.2)" />
  </svg>
)
const MeditationFigure = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#E9C877" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
    <circle cx="32" cy="16" r="6" fill="rgba(233,200,119,0.25)" />
    <path d="M32 22c-6 0-10 5-10 12 0 3 1 5 2 7" fill="rgba(233,200,119,0.08)" />
    <path d="M32 22c6 0 10 5 10 12 0 3-1 5-2 7" fill="rgba(233,200,119,0.08)" />
    <path d="M24 41c2-2 5-3 8-3s6 1 8 3" />
    <path d="M18 44c4-1 8 2 14 2s10-3 14-2" opacity="0.6" />
  </svg>
)
const TapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11V6a2 2 0 0 1 4 0v5M13 11V8a2 2 0 0 1 4 0v3M17 11a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-4.5-2L4 16a2 2 0 0 1 3-2.6l2 1.6" />
  </svg>
)
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" fill="rgba(201,149,74,0.08)" />
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" fill="rgba(201,149,74,0.08)" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)
const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="16" height="11" rx="1.5" fill="rgba(201,149,74,0.08)" />
    <path d="M12 9v11M4 13h16M12 9C10 9 8 8 8 6.5S9.5 5 12 9zM12 9c2 0 4-1 4-2.5S14.5 5 12 9z" />
  </svg>
)

// ─── Energy Ring ──────────────────────────────────────────────────
function EnergyRing({ pct }: { pct: number }) {
  const t = useT()
  const R = 42
  const C = 2 * Math.PI * R
  const dash = (pct / 100) * C
  return (
    <div style={{ position: "relative", width: 104, height: 104, flexShrink: 0 }}>
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={R} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle
          cx="52" cy="52" r={R} fill="none"
          stroke="url(#energyGrad)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${dash} ${C - dash}`}
          transform="rotate(-90 52 52)"
        />
        <defs>
          <linearGradient id="energyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E9C877" />
            <stop offset="100%" stopColor="#C9954A" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
          {t({ en: "Overall", zh: "综合", pt: "Geral", es: "General" }, "Overall")}
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--gold-light)", lineHeight: 1 }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}

// ─── Homepage ─────────────────────────────────────────────────────
export default function MantoHomePage() {
  const router = useRouter()
  const t = useT()

  // Deterministic daily values (seeded by date — stable across renders/SSR)
  const { energyPct, guidance, dims } = useMemo(() => {
    const d = new Date()
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()

    const guidanceOptions = [
      { en: "Today is a good day to stay patient and avoid rushed decisions.", zh: "今天适合保持耐心，避免仓促的决定。", pt: "Hoje é um bom dia para ter paciência e evitar decisões precipitadas.", es: "Hoy es un buen día para tener paciencia y evitar decisiones apresuradas." },
      { en: "Trust your intuition today — small signs point the right way.", zh: "今天请相信你的直觉，细微的征兆会指引方向。", pt: "Confie na sua intuição hoje — pequenos sinais mostram o caminho.", es: "Confía en tu intuición hoy: las pequeñas señales muestran el camino." },
      { en: "A calm heart attracts good fortune. Move gently through the day.", zh: "内心平静会招来好运，温柔地度过今天。", pt: "Um coração calmo atrai a boa sorte. Siga o dia com leveza.", es: "Un corazón tranquilo atrae la buena fortuna. Vive el día con calma." },
      { en: "Open yourself to new energy — an unexpected joy awaits.", zh: "敞开心接纳新的能量，会有意外的惊喜。", pt: "Abra-se para uma nova energia — uma alegria inesperada espera.", es: "Ábrete a una nueva energía: te espera una alegría inesperada." },
    ]

    const S = {
      rising:   { en: "Rising",   zh: "上升", pt: "Em alta",  es: "En alza",   color: "var(--gold-light)" },
      stable:   { en: "Stable",   zh: "平稳", pt: "Estável",  es: "Estable",   color: "var(--success)" },
      good:     { en: "Good",     zh: "良好", pt: "Bom",      es: "Bien",      color: "var(--success)" },
      cautious: { en: "Cautious", zh: "谨慎", pt: "Cauteloso",es: "Cauteloso", color: "var(--rose)" },
      calm:     { en: "Calm",     zh: "平和", pt: "Calmo",    es: "Calma",     color: "var(--blue)" },
    }
    const pool = {
      love:     [S.stable, S.rising, S.calm, S.cautious],
      career:   [S.rising, S.stable, S.cautious, S.good],
      wealth:   [S.cautious, S.stable, S.rising, S.calm],
      wellness: [S.good, S.calm, S.stable, S.rising],
    }
    const dims = [
      { key: "love",     Icon: HeartIcon,     label: { en: "Love",     zh: "爱情", pt: "Amor",      es: "Amor" },      status: pool.love[(seed + 1) % 4] },
      { key: "career",   Icon: BriefcaseIcon, label: { en: "Career",   zh: "事业", pt: "Carreira",  es: "Carrera" },   status: pool.career[(seed + 2) % 4] },
      { key: "wealth",   Icon: DiamondIcon,   label: { en: "Wealth",   zh: "财运", pt: "Riqueza",   es: "Riqueza" },   status: pool.wealth[(seed + 3) % 4] },
      { key: "wellness", Icon: LotusIcon,     label: { en: "Wellness", zh: "状态", pt: "Bem-estar", es: "Bienestar" }, status: pool.wellness[(seed + 4) % 4] },
    ]
    return {
      energyPct: 62 + (seed % 34),
      guidance: guidanceOptions[seed % guidanceOptions.length],
      dims,
    }
  }, [])

  const steps = [
    { num: 1, Icon: ThinkIcon, label: { en: "Think of a question", zh: "想一个问题", pt: "Pense numa pergunta", es: "Piensa una pregunta" } },
    { num: 2, Icon: ChooseIcon, label: { en: "Choose a card", zh: "选一张牌", pt: "Escolha uma carta", es: "Elige una carta" } },
    { num: 3, Icon: ReadIcon, label: { en: "Read your interpretation", zh: "阅读解读", pt: "Leia a interpretação", es: "Lee tu interpretación" } },
  ]

  return (
    <>
      <Starfield />
      <TopHeader />
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 'var(--content-max)', margin: '0 auto',
        padding: '0 20px 8px',
      }}>
        {/* ── Hero ── */}
        <section className="animate-fade-in-up" style={{ paddingTop: 12, paddingBottom: 20, textAlign: "center" }}>
          <div className="mh-hero-cards animate-float">
            <div className="mh-hero-card left"><div className="mh-hero-card-inner"><MoonIcon /></div></div>
            <div className="mh-hero-card right"><div className="mh-hero-card-inner"><SunIcon /></div></div>
            <div className="mh-hero-card center"><div className="mh-hero-card-inner"><CompassStar /></div></div>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700,
            color: 'var(--text-primary)', lineHeight: 1.25, margin: "4px 0 6px",
          }}>
            {t({ en: "Draw a Card,", zh: "翻一张牌，", pt: "Tire uma carta,", es: "Saca una carta," }, "Draw a Card,")}
            <br />
            <span className="text-gold-gradient">
              {t({ en: "See What Today Holds", zh: "看看今天怎么走", pt: "Veja o que hoje reserva", es: "Descubre lo que trae hoy" }, "See What Today Holds")}
            </span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            {t({ en: "Receive your guidance for today", zh: "领取属于你的今日指引", pt: "Receba a sua orientação de hoje", es: "Recibe tu guía para hoy" }, "Receive your guidance for today")}
          </p>

          <button className="btn-primary" onClick={() => router.push("/reading")}
            style={{ width: '100%', maxWidth: 300, padding: '14px 28px', fontSize: 15 }}>
            {t({ en: "Start Reading", zh: "开始占卜", pt: "Começar leitura", es: "Comenzar lectura" }, "Start Reading")}
          </button>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--gold)' }}>
            ✦ {t({ en: "First reading free", zh: "首次占卜免费", pt: "Primeira leitura grátis", es: "Primera lectura gratis" }, "First reading free")}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="card animate-fade-in-up delay-100" style={{ padding: 18, marginBottom: 16 }}>
          <div className="mh-section-title">
            {t({ en: "How It Works", zh: "如何使用", pt: "Como funciona", es: "Cómo funciona" }, "How It Works")}
          </div>
          <div className="mh-steps">
            {steps.map(s => (
              <div key={s.num} className="mh-step">
                <span className="mh-step-num">{s.num}</span>
                <span className="mh-step-icon"><s.Icon /></span>
                <span className="mh-step-label">{t(s.label, s.label.en)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Today's Energy ── */}
        <section className="card animate-fade-in-up delay-200" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="mh-section-title" style={{ marginBottom: 0 }}>
              {t({ en: "Today's Energy", zh: "今日能量", pt: "Energia de hoje", es: "Energía de hoy" }, "Today's Energy")}
            </div>
            <Link href="/fortune" className="mh-link">
              {t({ en: "View full reading", zh: "查看详情", pt: "Ver leitura completa", es: "Ver lectura completa" }, "View full reading")} →
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "16px 0 18px" }}>
            <EnergyRing pct={energyPct} />
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {t(guidance, guidance.en)}
            </p>
          </div>

          <div className="mh-stats">
            {dims.map(dim => (
              <div key={dim.key} className="mh-stat">
                <span className="mh-stat-icon"><dim.Icon color={dim.status.color} /></span>
                <div className="mh-stat-name">{t(dim.label, dim.label.en)}</div>
                <div className="mh-stat-status" style={{ color: dim.status.color }}>
                  {t(dim.status, dim.status.en)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Today's Picks ── */}
        <section className="animate-fade-in-up delay-300" style={{ marginBottom: 16 }}>
          <div className="mh-section-title">
            {t({ en: "Today's Picks", zh: "今日精选", pt: "Destaques de hoje", es: "Selección de hoy" }, "Today's Picks")}
          </div>
          <div className="mh-picks">
            <Link href="/daily-card" className="mh-pick">
              <span style={{ display: "block", marginBottom: 10 }}><CompassIcon /></span>
              <div className="mh-pick-title">
                {t({ en: "Daily Outlook", zh: "每日运势", pt: "Panorama diário", es: "Panorama diario" }, "Daily Outlook")}
              </div>
              <div className="mh-pick-desc">
                {t({ en: "Understand today's overall energy. Seize the right timing.", zh: "读懂今日整体能量，把握合适的时机。", pt: "Entenda a energia geral de hoje. Aproveite o momento certo.", es: "Comprende la energía general de hoy. Aprovecha el momento." }, "Understand today's overall energy. Seize the right timing.")}
              </div>
              <span className="mh-pick-arrow">→</span>
            </Link>
            <Link href="/reading" className="mh-pick">
              <span style={{ display: "block", marginBottom: 10 }}><HandsHeartIcon /></span>
              <div className="mh-pick-title">
                {t({ en: "Love Guidance", zh: "爱情指引", pt: "Guia do amor", es: "Guía del amor" }, "Love Guidance")}
              </div>
              <div className="mh-pick-desc">
                {t({ en: "Gain insight into emotional direction. Receive relationship guidance.", zh: "洞察情感的方向，获得关系的指引。", pt: "Ganhe clareza sobre o rumo emocional. Receba orientação afetiva.", es: "Descubre tu rumbo emocional. Recibe guía para tus relaciones." }, "Gain insight into emotional direction. Receive relationship guidance.")}
              </div>
              <span className="mh-pick-arrow">→</span>
            </Link>
          </div>
        </section>

        {/* ── Daily Blessing ── */}
        <section className="animate-fade-in-up delay-300" style={{ marginBottom: 16 }}>
          <div className="mh-section-title">
            {t({ en: "Daily Blessing", zh: "每日祈福", pt: "Bênção diária", es: "Bendición diaria" }, "Daily Blessing")}
          </div>
          <Link href="/temple" style={{ textDecoration: "none" }}>
            <div className="card-gold card-hover mh-blessing">
              <div className="mh-blessing-figure halo-glow"><MeditationFigure /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {t({ en: "Touch the guardian figure to complete today's intention.", zh: "轻触守护神像，完成今日的心愿。", pt: "Toque na figura guardiã para completar a intenção de hoje.", es: "Toca la figura guardiana para completar tu intención de hoy." }, "Touch the guardian figure to complete today's intention.")}
                </div>
                <span className="mh-tap-hint"><TapIcon /> {t({ en: "Tap to bless", zh: "轻触祈福", pt: "Toque para abençoar", es: "Toca para bendecir" }, "Tap to bless")}</span>
              </div>
            </div>
          </Link>
        </section>

        {/* ── Trust / Privacy ── */}
        <section className="card animate-fade-in-up delay-400" style={{ padding: 18, marginBottom: 8 }}>
          <div className="mh-section-title">
            {t({ en: "Private, safe, and just for you", zh: "隐私、安全，只属于你", pt: "Privado, seguro e só para você", es: "Privado, seguro y solo para ti" }, "Private, safe, and just for you")}
          </div>
          <div className="mh-trust">
            <div className="mh-trust-item">
              <div className="mh-trust-icon"><ShieldIcon /></div>
              <div className="mh-trust-text">{t({ en: "No public personal info", zh: "不公开个人信息", pt: "Sem dados pessoais públicos", es: "Sin datos personales públicos" }, "No public personal info")}</div>
            </div>
            <div className="mh-trust-item">
              <div className="mh-trust-icon"><LockIcon /></div>
              <div className="mh-trust-text">{t({ en: "Your readings are visible only to you", zh: "占卜记录仅你可见", pt: "Suas leituras só você vê", es: "Solo tú ves tus lecturas" }, "Your readings are visible only to you")}</div>
            </div>
            <div className="mh-trust-item">
              <div className="mh-trust-icon"><GiftIcon /></div>
              <div className="mh-trust-text">{t({ en: "First reading free", zh: "首次占卜免费", pt: "Primeira leitura grátis", es: "Primera lectura gratis" }, "First reading free")}</div>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 10.5, color: "var(--text-muted)", marginTop: 14 }}>
            {t({ en: "For self-discovery and entertainment only", zh: "仅供自我探索与娱乐", pt: "Apenas para autoconhecimento e entretenimento", es: "Solo para autoconocimiento y entretenimiento" }, "For self-discovery and entertainment only")}
          </p>
        </section>
      </div>
    </>
  )
}
