"use client"
import Link from "next/link"

const CRYSTALS = [
  { sku: "木", name: "绿幽灵", nameEN: "Green Phantom", emoji: "🌿", domains: ["生长","突破","事业上升"], desc: "适合正在起步、转型、或渴望突破停滞的你。火太旺时，木来持续燃烧。" },
  { sku: "火", name: "红玛瑙", nameEN: "Red Carnelian", emoji: "🔥", domains: ["热情","勇气","行动力"], desc: "适合陷入情绪低潮或需要做出勇敢决定的你。水满则寒，火来温暖深处。" },
  { sku: "土", name: "黄水晶", nameEN: "Citrine", emoji: "⛰️", domains: ["稳定","财运","贵人"], desc: "适合正在迎接重大转变的你。命运的重量需要土来承载。" },
  { sku: "金", name: "白水晶", nameEN: "Clear Quartz", emoji: "✨", domains: ["净化","决断","智慧"], desc: "适合思绪纷乱、需要做出清晰判断的你。金能聚神，让杂念归零。" },
  { sku: "水", name: "黑曜石", nameEN: "Black Obsidian", emoji: "💧", domains: ["保护","辟邪","内在平静"], desc: "适合逆流中的你。以柔克刚，把暗涌挡在外面。" },
]

export default function CrystalListPage() {
  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 32 }}>
        <div className="page-header" style={{ padding: '16px 0' }}>
          <h1>五行补能手串</h1>
          <p style={{ marginTop: 8 }}>📿 守护水晶</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {CRYSTALS.map(crystal => (
            <Link key={crystal.sku} href={`/crystal/${crystal.sku}`} style={{ textDecoration: 'none' }}>
              <div className="card-gold card-hover" style={{
                padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--bg-card-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, flexShrink: 0,
                }}>
                  {crystal.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)', marginBottom: 4,
                  }}>
                    {crystal.name}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'var(--font-sans)' }}>
                      {crystal.nameEN}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {crystal.domains.map(d => (
                      <span key={d} className="tag" style={{ fontSize: 10, padding: '2px 10px' }}>{d}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{crystal.desc}</div>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 700, color: 'var(--gold-light)',
                  fontFamily: 'var(--font-mono)', flexShrink: 0,
                }}>
                  $39.99
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
