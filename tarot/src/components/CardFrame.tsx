"use client"
import { useCardName } from "@/lib/i18n/context"
import type { TarotCardData } from "@/lib/tarot/cards"

/**
 * A tarot card with an ornate gold frame and a name plaque below.
 *
 * Props:
 * - card:     card data (must include imageUrl + multi-lang names)
 * - width:    card image width in px  (default 120)
 * - back:     render the card-back image instead (default false)
 * - revealed: show the face image (ignored when back=true)
 * - label:    override the plaque text (ignored when back=true)
 * - glow:     add breath-glow to the frame (default true)
 * - onClick:  wrapped in a button if provided
 */
export default function CardFrame({
  card, width = 120, back = false, revealed = false, label, glow = true, onClick, noPlaque,
}: {
  card?: TarotCardData
  width?: number
  back?: boolean
  revealed?: boolean
  label?: string
  glow?: boolean
  onClick?: () => void
  noPlaque?: boolean   // suppress name plaque (e.g. for 3D flip where it mirrors)
}) {
  const getCardName = useCardName()

  // Aspect ratio: tarot cards are roughly 1:1.48
  const height = Math.round(width * 1.48)
  const plaqueH = Math.round(width * 0.18)   // name plaque — compact
  const framePad = Math.round(width * 0.03)   // 3% frame padding
  const totalH = height + framePad * 2 + plaqueH

  const nameText = !back && card
    ? (label || getCardName(card))
    : ""

  // Determine image source
  const imgSrc = back
    ? "/cards/back.webp"
    : revealed && card
      ? card.imageUrl
      : "/cards/back.webp"

  const inner = (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative',
    }}>
      {/* Gold outer frame */}
      <div style={{
        position: 'relative',
        padding: framePad,
        background: glow
          ? 'linear-gradient(145deg, #5C3D1A 0%, #C9954A 30%, #A67A38 50%, #C9954A 70%, #5C3D1A 100%)'
          : 'linear-gradient(145deg, #3D2912 0%, #8A6A32 30%, #7A5C28 50%, #8A6A32 70%, #3D2912 100%)',
        borderRadius: framePad + 2,
        boxShadow: glow
          ? '0 0 18px rgba(201,149,74,0.25), 0 0 40px rgba(201,149,74,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 0 8px rgba(201,149,74,0.10)',
        width: width + framePad * 2,
      }}>
        {/* Inner bevel ring */}
        <div style={{
          position: 'absolute', inset: 0,
          border: '1px solid rgba(212,168,83,0.2)',
          borderRadius: framePad + 2,
          pointerEvents: 'none',
        }} />

        {/* Card image */}
        <div style={{
          width, height,
          borderRadius: framePad,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <img
            src={imgSrc}
            alt={back ? "Card Back" : (card?.nameEn || "Tarot Card")}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            }}
          />
          {/* Subtle inner shadow overlay for depth */}
          <div style={{
            position: 'absolute', inset: 0,
            boxShadow: 'inset 0 0 12px rgba(0,0,0,0.3), inset 0 0 2px rgba(201,149,74,0.1)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* Name plaque — only when face-up, no background box */}
      {!back && !noPlaque && nameText ? (
        <div style={{
          marginTop: 4,
          textAlign: 'center',
          width: width + framePad * 2,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: Math.round(width * 0.095),
            fontWeight: 500,
            color: 'var(--gold-light)',
            letterSpacing: '0.03em',
            lineHeight: 1.3,
          }}>
            {nameText}
          </span>
        </div>
      ) : null}
    </div>
  )

  if (onClick) {
    return (
      <button onClick={onClick} style={{
        background: 'none', border: 'none', padding: 0,
        cursor: 'pointer', display: 'block',
        transition: 'transform 0.2s ease',
      }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        onTouchStart={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
        onTouchEnd={e => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        {inner}
      </button>
    )
  }

  return inner
}
