"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useT } from "@/lib/i18n/context"

const TarotIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? "var(--gold-light)" : "var(--text-muted)"}
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="4" width="12" height="16" rx="2" fill={active ? "rgba(201,149,74,0.12)" : "none"} />
    <path d="M4 7v11a2 2 0 0 0 2 2h9" opacity="0.7" />
    <path d="M13 8l1.2 2.2L16.5 11l-1.8 1.4.5 2.4-2.2-1.2-2.2 1.2.5-2.4L9.5 11l2.3-.8L13 8z"
      fill={active ? "#D4A853" : "none"} stroke={active ? "#D4A853" : "var(--text-muted)"} strokeWidth="1.2" />
  </svg>
)

const BlessingIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? "var(--gold-light)" : "var(--text-muted)"}
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5.5" r="2" fill={active ? "rgba(201,149,74,0.15)" : "none"} />
    <path d="M12 8v6" />
    <path d="M12 10c-2.5 0-4.5 1.5-5 4h10c-.5-2.5-2.5-4-5-4z" fill={active ? "rgba(201,149,74,0.1)" : "none"} />
    <path d="M12 14c3 0 6-1.5 8-3-1 3.5-4 5-8 5s-7-1.5-8-5c2 1.5 5 3 8 3z" opacity="0.8" />
  </svg>
)

const CrystalIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? "var(--gold-light)" : "var(--text-muted)"}
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l3 6-9 12L3 9l3-6z" fill={active ? "rgba(201,149,74,0.1)" : "none"} />
    <path d="M3 9h18M9 3l-1 6 4 12 4-12-1-6" opacity="0.8" />
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? "var(--gold-light)" : "var(--text-muted)"}
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" fill={active ? "rgba(201,149,74,0.08)" : "none"} />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>
)

const NAV_ITEMS = [
  { href: "/",        labels: { en: "Tarot",    zh: "占卜", pt: "Tarô",     es: "Tarot" },     Icon: TarotIcon },
  { href: "/temple",  labels: { en: "Blessing", zh: "拜神", pt: "Bênção",   es: "Bendición" }, Icon: BlessingIcon },
  { href: "/crystal", labels: { en: "Crystals", zh: "水晶", pt: "Cristais", es: "Cristales" }, Icon: CrystalIcon },
  { href: "/profile", labels: { en: "Profile",  zh: "我",   pt: "Perfil",   es: "Perfil" },    Icon: ProfileIcon },
]

function BottomNav({ pathname }: { pathname: string }) {
  const t = useT()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(13,13,13,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '0.5px solid var(--border)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        maxWidth: 480, margin: '0 auto',
        display: 'flex', justifyContent: 'space-around',
        alignItems: 'center', height: 56,
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, width: 64, textDecoration: 'none',
              position: 'relative', padding: '6px 0',
            }}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20, height: 2, borderRadius: 1,
                  background: 'var(--gold-light)',
                }} />
              )}
              <item.Icon active={isActive} />
              <span style={{
                fontSize: 10, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--gold-light)' : 'var(--text-muted)',
                transition: 'color 0.15s ease',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.02em',
              }}>
                {t(item.labels, item.labels.en)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div style={{ minHeight: '100dvh' }}>
      <div style={{ paddingBottom: 76 }}>
        {children}
      </div>
      <BottomNav pathname={pathname} />
    </div>
  )
}
