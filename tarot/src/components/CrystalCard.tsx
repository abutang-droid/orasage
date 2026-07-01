"use client"
interface CrystalCardProps { name: string; spec: string; description: string }
const GLYPHS: Record<string, string> = { "红玛瑙": "🔥", "黑曜石": "💧", "绿幽灵": "🌿", "黄水晶": "⭐", "白水晶": "✦" }
export default function CrystalCard({ name, spec, description }: CrystalCardProps) {
  return (
    <div className="glass rounded-[var(--radius-md)] p-4 animate-fade-in-up" style={{ borderLeft: '3px solid var(--gold)' }}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, rgba(201,149,74,0.2), rgba(201,149,74,0.05))', border: '1px solid rgba(201,149,74,0.15)' }}>{GLYPHS[name] || "✦"}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>{name}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,149,74,0.1)', color: 'var(--gold-dark)' }}>{spec}</span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--ivory-dim)' }}>{description}</div>
        </div>
      </div>
    </div>
  )
}
