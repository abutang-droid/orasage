"use client"
import Link from "next/link"
import { shopUrlForWuxing } from "@/lib/shop-products"
import { useCrystalCopy } from "@/lib/i18n/crystal-copy"

export default function CrystalListPage() {
  const crystal = useCrystalCopy()

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 32 }}>
        <div className="page-header" style={{ padding: '16px 0' }}>
          <h1>{crystal.listTitle}</h1>
          <p style={{ marginTop: 8 }}>{crystal.listSubtitle}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {crystal.list.map((item) => (
            <Link key={item.sku} href={shopUrlForWuxing(item.sku)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <div className="card-gold card-hover" style={{
                padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--bg-card-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, flexShrink: 0,
                }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)', marginBottom: 4,
                  }}>
                    {item.name}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'var(--font-sans)' }}>
                      {item.nameEN}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {item.domains.map((d) => (
                      <span key={d} className="tag" style={{ fontSize: 10, padding: '2px 10px' }}>{d}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--gold-light)',
                  fontFamily: 'var(--font-mono)', flexShrink: 0,
                }}>
                  {crystal.shopLink}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
