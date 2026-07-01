"use client"
import { useRouter } from "next/navigation"
import { useLang, type Lang } from "@/lib/i18n/context"

const LANG_OPTIONS: { lang: Lang; native: string; emoji: string }[] = [
  { lang: "zh", native: "简体中文", emoji: "🇨🇳" },
  { lang: "pt", native: "Português",  emoji: "🇧🇷" },
  { lang: "es", native: "Español",    emoji: "🇲🇽" },
  { lang: "en", native: "English",    emoji: "🇺🇸" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { lang, setLang } = useLang()

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 32, paddingBottom: 32 }}>
        <div className="page-header" style={{ padding: '16px 0' }}>
          <h1>设置</h1>
        </div>

        {/* 1. 个人信息 */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>帐号</div>
          <button
            onClick={() => router.push("/profile/edit")}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: '16px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ fontSize: 22 }}>👤</span>
            <span style={{ flex: 1, textAlign: 'left' }}>个人信息</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
          </button>
        </div>

        {/* 2. 订单详情 */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>购买</div>
          <button
            onClick={() => router.push("/profile/orders")}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: '16px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ fontSize: 22 }}>📦</span>
            <span style={{ flex: 1, textAlign: 'left' }}>订单详情</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
          </button>
        </div>

        {/* 3. 语言切换 */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>语言 / Language</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LANG_OPTIONS.map(opt => {
              const active = lang === opt.lang
              return (
                <button
                  key={opt.lang}
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

        {/* 4. 邀请好友 */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>社群</div>
          <button
            onClick={() => {
              const shareText = "用 Manto 翻牌看运，拜神护体。一起来 → https://manto.app"
              if (navigator.share) {
                navigator.share({ title: "Manto — 翻牌看运", text: shareText, url: window.location.origin })
              } else {
                navigator.clipboard.writeText(shareText).then(() => alert("邀请链接已复制到剪贴板"))
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: '16px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 15,
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ fontSize: 22 }}>💌</span>
            <span style={{ flex: 1, textAlign: 'left' }}>邀请好友</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
