"use client"
import { useState, useRef, useEffect } from "react"
import { useLang, type Lang } from "@/lib/i18n/context"

const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "zh", label: "中文", short: "中" },
  { code: "pt", label: "Português", short: "PT" },
  { code: "es", label: "Español", short: "ES" },
]

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

export default function TopHeader() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const current = LANGS.find(l => l.code === lang) ?? LANGS[0]

  return (
    <header className="mh-header">
      <div className="mh-header-inner">
        <span className="mh-logo text-gold-gradient">Manto</span>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="mh-lang-wrap" ref={wrapRef}>
            <button
              className="mh-icon-btn"
              aria-label="Select language"
              aria-expanded={open}
              onClick={() => setOpen(o => !o)}
            >
              <span>{current.label}</span>
              <ChevronIcon />
            </button>
            {open && (
              <div className="mh-lang-menu" role="menu">
                {LANGS.map(l => (
                  <button
                    key={l.code}
                    className={`mh-lang-item${l.code === lang ? " active" : ""}`}
                    role="menuitemradio"
                    aria-checked={l.code === lang}
                    onClick={() => { setLang(l.code); setOpen(false) }}
                  >
                    <span style={{ width: 22, fontWeight: 600 }}>{l.short}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="mh-icon-btn square" aria-label="Notifications">
            <BellIcon />
          </button>
        </div>
      </div>
    </header>
  )
}
