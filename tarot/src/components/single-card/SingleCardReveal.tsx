'use client';

import { TarotFlipCard } from '@/components/TarotFlipCard';
import { useCardName } from '@/lib/i18n/context';
import { getCardById } from '@/lib/tarot/cards';
import type { SingleCardStoredCard } from '@/lib/single-card/types';

type Props = {
  card: SingleCardStoredCard | null;
  revealed: boolean;
  orientationLabel: (o: '正位' | '逆位') => string;
  hint?: string;
};

export function SingleCardReveal({ card, revealed, orientationLabel, hint }: Props) {
  const cardNameFor = useCardName();
  const cardMeta = card ? getCardById(card.cardId) : null;

  return (
    <div className="single-card-reveal">
      {hint ? <p className="single-card-reveal-hint">{hint}</p> : null}
      <div className="single-card-reveal-body">
        {cardMeta ? (
          <TarotFlipCard
            card={cardMeta}
            flipped={revealed}
            glowing={revealed}
            size="lg"
            orientation={card?.orientation ?? '正位'}
          />
        ) : (
          <div className="single-card-reveal-placeholder" aria-hidden />
        )}
        {revealed && card && cardMeta ? (
          <div className="single-card-reveal-meta">
            <p className="single-card-reveal-name">{cardNameFor(cardMeta)}</p>
            <p className="single-card-reveal-orientation">{orientationLabel(card.orientation)}</p>
          </div>
        ) : (
          <p className="single-card-reveal-pending">···</p>
        )}
      </div>
    </div>
  );
}
