"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavIconProps { active: boolean }
const HomeIcon = ({ active }: NavIconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C9954A" : "rgba(237,228,212,0.35)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
)
const CardIcon = ({ active }: NavIconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C9954A" : "rgba(237,228,212,0.35)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 12h8"/><path d="M10 8h4"/><path d="M10 16h4"/>
  </svg>
)
const ReadingIcon = ({ active }: NavIconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C9954A" : "rgba(237,228,212,0.35)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7a5 5 0 1 0 5 5"/><circle cx="12" cy="12" r="1" fill={active ? "#C9954A" : "rgba(237,228,212,0.35)"}/>
  </svg>
)
const KnowledgeIcon = ({ active }: NavIconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C9954A" : "rgba(237,228,212,0.35)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 8h7"/><path d="M9 12h4"/>
  </svg>
)
const ProfileIcon = ({ active }: NavIconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#C9954A" : "rgba(237,228,212,0.35)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
)

const NAV_ITEMS = [
  { href: "/", label: "首页", Icon: HomeIcon },
  { href: "/daily-card", label: "抽卡", Icon: CardIcon },
  { href: "/reading", label: "占卜", Icon: ReadingIcon },
  { href: "/knowledge", label: "知识", Icon: KnowledgeIcon },
  { href: "/profile", label: "我的", Icon: ProfileIcon },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(5, 8, 20, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(201, 149, 74, 0.1)' }}>
      <div className="max-w-lg mx-auto flex justify-around items-center h-[68px] px-2">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-[56px] gap-[3px]">
              <item.Icon active={isActive} />
              <span className={`text-[10px] tracking-[0.04em] font-medium transition-colors ${isActive ? 'text-[#C9954A]' : 'text-[rgba(237,228,212,0.35)]'}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
