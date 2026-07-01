"use client"
import { useParams } from "next/navigation"
import Link from "next/link"

const CRYSTAL_MAP: Record<string, { name: string; nameEN: string; emoji: string; wuxing: string; domains: string[]; desc: string; color: string }> = {
  "木": { name: "绿幽灵", nameEN: "Green Phantom Quartz", emoji: "🌿", wuxing: "木", color: "#5B8C5A",
    domains: ["生长","突破","事业上升"],
    desc: "绿幽灵是事业与财富的催化剂。五行属木——木能生火，当你的权杖之火需要持续燃烧时，绿幽灵提供源源不断的生长能量。适合正在起步、转型、或渴望突破停滞的你。" },
  "火": { name: "红玛瑙", nameEN: "Red Carnelian", emoji: "🔥", wuxing: "火", color: "#C45B4A",
    domains: ["热情","勇气","行动力"],
    desc: "红玛瑙点燃内在的火焰。五行属火——火能暖水，当圣杯之水寒冷淤滞时，红玛瑙带来温暖的流动。适合陷入情绪低潮或需要做出勇敢决定的你。" },
  "土": { name: "黄水晶", nameEN: "Citrine", emoji: "⛰️", wuxing: "土", color: "#D4A853",
    domains: ["稳定","财运","贵人"],
    desc: "黄水晶是丰盛与稳固的象征。五行属土——土承载万物，当命运的重牌出现时，黄水晶帮你站稳脚跟。适合正在迎接重大转变的你。" },
  "金": { name: "白水晶", nameEN: "Clear Quartz", emoji: "✨", wuxing: "金", color: "#E8E0D5",
    domains: ["净化","决断","智慧"],
    desc: "白水晶是净化与聚焦的明镜。五行属金——金能聚神，当思绪如宝剑四散时，白水晶帮你把注意力的光聚成一道。适合思绪纷乱、需要做出清晰判断的你。" },
  "水": { name: "黑曜石", nameEN: "Black Obsidian", emoji: "💧", wuxing: "水", color: "#3A3A3A",
    domains: ["保护","辟邪","内在平静"],
    desc: "黑曜石是守护与平静的屏障。五行属水——水能以柔克刚，当牌面逆位增多时，黑曜石把外界暗涌挡在外面。适合逆流中需要保护的你。" },
}

export default function CrystalDetailPage() {
  const params = useParams()
  const sku = (params?.sku as string) || "金"
  const crystal = CRYSTAL_MAP[sku] || CRYSTAL_MAP["金"]

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 24 }}>
        <Link href="/crystal" style={{
          fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
          fontFamily: 'var(--font-sans)',
        }}>
          ← 返回商城
        </Link>

        {/* Crystal display */}
        <div style={{
          width: '100%', maxWidth: 300, margin: '0 auto 24px',
          height: 300, borderRadius: 'var(--radius-xl)',
          background: `linear-gradient(160deg, rgba(201,149,74,0.08), rgba(201,149,74,0.03))`,
          border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 96, position: 'relative',
        }}>
          {crystal.emoji}
          <div style={{
            position: 'absolute', bottom: 16,
            fontSize: 11, color: 'var(--text-muted)',
          }}>
            8mm × 23颗 · 弹力绳
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 600, color: 'var(--text-primary)',
            fontFamily: 'var(--font-serif)', marginBottom: 4,
          }}>
            {crystal.emoji} {crystal.name}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
            {crystal.nameEN} · 五行属{crystal.wuxing}
          </div>
        </div>

        {/* Rating */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ color: 'var(--gold-light)', fontSize: 14 }}>⭐ 4.8</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>(1,234 条评价)</span>
        </div>

        {/* Energy properties */}
        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>能量属性</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {crystal.domains.map(d => (
              <span key={d} className="tag" style={{ fontSize: 11 }}>{d}</span>
            ))}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8 }}>
            {crystal.desc}
          </p>
        </div>

        {/* Wearer story */}
        <div className="card" style={{ padding: '20px', marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>佩戴故事</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8, fontStyle: 'italic' }}>
            "戴上它去面试，拿到了offer。不知道是不是水晶的关系，但那天我特别敢说话。"
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            — 🇧🇷 Ana
          </div>
        </div>

        {/* Buy CTA */}
        <button className="btn-primary" style={{ width: '100%', marginBottom: 12 }}>
          📿 请一条 · $39.99
        </button>
        <Link href="/temple" style={{
          display: 'flex', justifyContent: 'center', width: '100%',
          textDecoration: 'none',
        }}>
          <span className="btn-outline" style={{ width: '100%', textAlign: 'center' }}>
            🛐 请守护神加持这条手串
          </span>
        </Link>

        <div style={{
          textAlign: 'center', marginTop: 16, marginBottom: 32,
          fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)',
        }}>
          已佩戴 2,341 人 · 配送 7-10 天（巴西）
        </div>
      </div>
    </div>
  )
}
