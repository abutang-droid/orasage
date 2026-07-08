"use client"
import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@orasage/ui/button"
import { useCardName } from "@/lib/i18n/context"
import { useWishCopy } from "@/lib/i18n/ui-strings"
import { getCardById } from "@/lib/tarot/cards"

type WishResult = {
  cardId?: number
  cardName: string
  orientation: "正位" | "逆位"
  conclusion: string
  advice?: string
  adviceIdx?: number
}

export default function WishPage() {
  const wish = useWishCopy()
  const cardNameFor = useCardName()
  const [wishText, setWishText] = useState("")
  const [result, setResult] = useState<WishResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!wishText.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wish: wishText.trim() }),
      })
      if (res.ok) setResult(await res.json())
    } catch (e) {}
    finally { setLoading(false) }
  }

  const conclusionKey = result?.conclusion ?? ""
  const conclusionStyle = wish.conclusionStyle(conclusionKey)
  const localizedAdvice =
    result?.adviceIdx != null
      ? wish.adviceAt(result.adviceIdx)
      : result?.advice ?? ""
  const displayCardName = result
    ? (() => {
        const card = result.cardId != null ? getCardById(result.cardId) : undefined
        return card ? cardNameFor(card) : result.cardName
      })()
    : ""

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 20px' }}>

      <div className="page-header animate-fade-in-up">
        <span className="label">{wish.label}</span>
        <h1>{wish.title}</h1>
        <p>{wish.subtitle}</p>
      </div>

      <div className="animate-fade-in-up" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '22px',
        marginBottom: 16,
        boxShadow: 'var(--shadow-sm)',
        animationDelay: '0.1s',
      }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{
            display: 'block', fontSize: 12,
            color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500,
          }}>
            {wish.wishLabel}
          </label>
          <textarea
            value={wishText}
            onChange={e => setWishText(e.target.value)}
            placeholder={wish.placeholder}
            className="input-field"
            rows={4}
            maxLength={200}
          />
          <div style={{
            textAlign: 'right', fontSize: 11,
            color: 'var(--text-faint)', marginTop: 4,
          }}>
            {wishText.length}/200
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !wishText.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 1.5 }} />
              <span>{wish.divining}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} strokeWidth={1.75} aria-hidden />
              {wish.submit}
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center',
          }}>
            <div className="section-label" style={{ marginBottom: 10 }}>{wish.cardDrawn}</div>
            <div style={{
              fontSize: 20, fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              marginBottom: 4,
            }}>
              {displayCardName}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 500,
              color: result.orientation === '正位' ? 'var(--green)' : 'var(--rose)',
              background: result.orientation === '正位' ? 'var(--green-pale)' : 'var(--rose-pale)',
              padding: '2px 12px', borderRadius: 20,
              display: 'inline-block',
            }}>
              {result.orientation === '正位' ? wish.upright : wish.reversed}
            </div>
          </div>

          {conclusionKey && (
            <div style={{
              background: conclusionStyle.bg,
              border: `1px solid ${conclusionStyle.color}30`,
              borderRadius: 'var(--radius-lg)',
              padding: '22px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                fontSize: 36, fontWeight: 700,
                color: conclusionStyle.color,
                fontFamily: 'var(--font-serif)',
                marginBottom: 4,
              }}>
                {wish.conclusionKey(conclusionKey)}
              </div>
              <div style={{ fontSize: 12, color: conclusionStyle.color, opacity: 0.7, marginBottom: 14 }}>
                {wish.conclusionDesc(conclusionKey)}
              </div>
              <div className="divider" style={{ margin: '14px 0' }} />
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.85 }}>
                {localizedAdvice}
              </div>
            </div>
          )}

          <div style={{
            background: 'var(--gold-subtle)',
            border: '1px solid rgba(201,149,74,0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 14, color: 'var(--gold)', flexShrink: 0 }}>💫</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}>
              「{wishText}」
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => { setResult(null); setWishText("") }}
            className="w-full"
          >
            {wish.again}
          </Button>
        </div>
      )}
    </div>
  )
}
