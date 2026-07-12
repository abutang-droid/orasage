'use client';

import { useCardName } from '@/lib/i18n/context';
import { getCardById } from '@/lib/tarot/cards';
import type { SingleCardStoredCard } from '@/lib/single-card/types';

function SingleCardIcon({ revealed }: { revealed: boolean }) {
  return (
    <div
      className={`single-card-reveal-icon${revealed ? ' single-card-reveal-icon--revealed' : ''}`}
      aria-hidden
    >
      <span className="single-card-reveal-icon-orbit" />
      <span className="single-card-reveal-icon-core" />
      <span className="single-card-reveal-icon-spark single-card-reveal-icon-spark--1" />
      <span className="single-card-reveal-icon-spark single-card-reveal-icon-spark--2" />
      <span className="single-card-reveal-icon-spark single-card-reveal-icon-spark--3" />
    </div>
  );
}

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
        <SingleCardIcon revealed={revealed} />
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
