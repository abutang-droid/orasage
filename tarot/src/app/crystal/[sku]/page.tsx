"use client"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Church } from "lucide-react"
import { useState } from "react"
import { Button } from "@orasage/ui/button"
import { useCrystalCopy } from "@/lib/i18n/crystal-copy"
import { WUXING_CRYSTAL_SKU } from "@/lib/reading-sync"
import { startAppCheckout, redirectAfterCheckout } from "@/lib/shop-checkout"

export default function CrystalDetailPage() {
  const params = useParams()
  const crystalCopy = useCrystalCopy()
  const sku = (params?.sku as string) || "金"
  const crystal = crystalCopy.get(sku)
  const shopSku = WUXING_CRYSTAL_SKU[crystal.wuxing]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    if (!shopSku) return
    setLoading(true)
    setError(null)
    try {
      const result = await startAppCheckout({
        sku: shopSku,
        recommendationContext: `塔罗商城推荐：${crystal.name}`,
        successUrl: `${window.location.origin}/crystal/${sku}?paid=1`,
      })
      redirectAfterCheckout(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : crystalCopy.checkoutError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ paddingTop: 24 }}>
        <Link href="/crystal" style={{
          fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
          fontFamily: 'var(--font-sans)',
        }}>
          {crystalCopy.backToShop}
        </Link>

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
            {crystalCopy.beadSpec}
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
            {crystal.nameEN} · {crystalCopy.wuxingLabel(crystal.wuxingLabel)}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ color: 'var(--gold-light)', fontSize: 14 }}>⭐ 4.8</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>{crystalCopy.rating}</span>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>{crystalCopy.energyAttrs}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {crystal.domains.map((d) => (
              <span key={d} className="tag" style={{ fontSize: 11 }}>{d}</span>
            ))}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8 }}>
            {crystal.desc}
          </p>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 24 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>{crystalCopy.wearingStory}</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.8, fontStyle: 'italic' }}>
            &ldquo;{crystal.story}&rdquo;
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            — {crystal.storyAuthor}
          </div>
        </div>

        <Button
          type="button"
          className="w-full mb-3"
          disabled={loading || !shopSku}
          onClick={() => void handleBuy()}
        >
          {loading ? crystalCopy.buyLoading : crystalCopy.buy(crystal.name)}
        </Button>
        {error && (
          <p style={{ color: 'var(--error, #c45b4a)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/temple" className="flex w-full justify-center no-underline">
            <Church size={18} strokeWidth={1.75} aria-hidden />
            {crystalCopy.blessLink}
          </Link>
        </Button>

        <div style={{
          textAlign: 'center', marginTop: 16, marginBottom: 32,
          fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)',
        }}>
          {crystalCopy.wornBy}
        </div>
      </div>
    </div>
  )
}
