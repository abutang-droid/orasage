'use client';

import CardFrame from '@/components/CardFrame';
import type { TarotCardData } from '@/lib/tarot/cards';

const SIZE_WIDTH = {
  sm: 80,
  md: 107,
  lg: 160,
} as const;

type TarotFlipCardProps = {
  card: TarotCardData;
  flipped?: boolean;
  glowing?: boolean;
  size?: keyof typeof SIZE_WIDTH;
  orientation?: '正位' | '逆位';
  onClick?: () => void;
  caption?: string;
  disabled?: boolean;
};

/** 使用 /cards/*.webp 真实牌面，带 3D 翻牌动画 */
export function TarotFlipCard({
  card,
  flipped = false,
  glowing = false,
  size = 'md',
  orientation = '正位',
  onClick,
  caption,
  disabled = false,
}: TarotFlipCardProps) {
  const width = SIZE_WIDTH[size];
  const framePad = Math.round(width * 0.03);
  const plaqueH = Math.round(width * 0.18);
  const cardH = Math.round(width * 1.48);
  const totalH = cardH + framePad * 2 + (caption ? 0 : plaqueH);

  const inner = (
    <div
      className={`tarot-flip-card${glowing ? ' tarot-flip-card--glow' : ''}`}
      style={{ width: width + framePad * 2, height: totalH }}
    >
      <div
        className={`tarot-flip-card-inner${flipped ? ' is-flipped' : ''}`}
        style={{ height: cardH + framePad * 2 }}
      >
        <div className="tarot-flip-card-face tarot-flip-card-face--back">
          <CardFrame back width={width} glow={glowing} noPlaque />
        </div>
        <div className="tarot-flip-card-face tarot-flip-card-face--front">
          <div
            className={orientation === '逆位' ? 'tarot-flip-card-reversed' : undefined}
            style={{ display: 'inline-block' }}
          >
            <CardFrame card={card} revealed width={width} glow={glowing} noPlaque />
          </div>
        </div>
      </div>
      {caption ? (
        <p className="tarot-flip-card-caption">{caption}</p>
      ) : (
        flipped && (
          <p className="tarot-flip-card-caption">
            {card.name}
            {orientation ? ` · ${orientation}` : ''}
          </p>
        )
      )}
    </div>
  );

  if (onClick && !disabled) {
    return (
      <button
        type="button"
        className="tarot-flip-card-btn"
        onClick={onClick}
        aria-label={flipped ? `${card.name} ${orientation}` : '翻开塔罗牌'}
      >
        {inner}
      </button>
    );
  }

  return inner;
}
