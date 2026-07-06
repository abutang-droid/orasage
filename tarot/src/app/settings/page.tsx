"use client"
import { useEffect, useState } from "react"
import { useLang, type Lang } from "@/lib/i18n/context"
import { useUser } from "@/lib/user"
import { formatFaithLabel } from "@/lib/faiths/religions"
import { profileUrlFromLang } from "@/lib/orasage-locale"

const LANG_OPTIONS: { lang: Lang; native: string; emoji: string }[] = [
  { lang: "zh", native: "简体中文", emoji: "🇨🇳" },
  { lang: "pt", native: "Português",  emoji: "🇧🇷" },
  { lang: "es", native: "Español",    emoji: "🇲🇽" },
  { lang: "en", native: "English",    emoji: "🇺🇸" },
]

export default function SettingsPage() {
  const { lang, setLang } = useLang()
  const { user } = useUser()
  const [deityName, setDeityName] = useState<string | null>(null)
  const profileBase = profileUrlFromLang(lang)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("manto:deity")
      if (raw) setDeityName(JSON.parse(raw).name ?? null)
    } catch {
      setDeityName(null)
    }
  }, [])

  const rowStyle = {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 14,
    width: '100%',
    padding: '16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer' as const,
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--text-primary)',
    textDecoration: 'none' as const,
  }

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="page-header" style={{ padding: '16px 0' }}>
          <h1>设置</h1>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>帐号</div>
          <a href={profileBase} style={rowStyle}>
            <span style={{ fontSize: 22 }}>👤</span>
            <span style={{ flex: 1, textAlign: 'left' }}>个人信息</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
          </a>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>购买</div>
          <a href={`${profileBase}/orders`} style={rowStyle}>
            <span style={{ fontSize: 22 }}>📦</span>
            <span style={{ flex: 1, textAlign: 'left' }}>订单详情</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
          </a>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>祈福</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="/temple?change=faith" style={rowStyle}>
              <span style={{ fontSize: 22 }}>🌍</span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ display: 'block' }}>更换信仰与地区</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {user?.faith ? formatFaithLabel(user.faith) : '未设置'}
                  {user?.countryCode ? ` · ${user.countryCode}` : ''}
                </span>
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
            </a>
            <a href="/temple?change=deity" style={rowStyle}>
              <span style={{ fontSize: 22 }}>🛐</span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ display: 'block' }}>更换守护神</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {deityName ?? '未选择'}
                </span>
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
            </a>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>语言 / Language</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LANG_OPTIONS.map(opt => {
              const active = lang === opt.lang
              return (
                <button
                  key={opt.lang}
                  type="button"
                  onClick={() => setLang(opt.lang)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    width: '100%', padding: '12px 16px',
                    background: active ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    border: `1px solid ${active ? 'var(--border-focus)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', fontSize: 15,
                    color: active ? 'var(--gold-light)' : 'var(--text-primary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{opt.emoji}</span>
                  <span style={{ flex: 1, textAlign: 'left', fontWeight: active ? 600 : 400 }}>
                    {opt.native}
                  </span>
                  {active && (
                    <span style={{
                      fontSize: 11, color: 'var(--gold-light)',
                      background: 'rgba(201,149,74,0.12)',
                      padding: '2px 10px', borderRadius: 'var(--radius-pill)',
                    }}>
                      ✓ 当前
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
