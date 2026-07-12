'use client';

import { useState } from 'react';

const DECK_SIZE = 9;

type Props = {
  disabled?: boolean;
  hint: string;
  pickLabel: string;
  onPick: (index: number) => void;
};

export function DestinySliceDeck({ disabled, hint, pickLabel, onPick }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const handlePick = (index: number) => {
    if (disabled || picked != null) return;
    setPicked(index);
    onPick(index);
  };

  return (
    <div className="destiny-slice-deck">
      <p className="destiny-slice-deck-hint">{hint}</p>
      <div className="destiny-slice-deck-fan" aria-label={pickLabel}>
        {Array.from({ length: DECK_SIZE }, (_, i) => {
          const offset = i - Math.floor(DECK_SIZE / 2);
          const rotate = offset * 7;
          const translateY = Math.abs(offset) * 4;
          const isActive = hovered === i || picked === i;
          return (
            <button
              key={i}
              type="button"
              className={`destiny-slice-deck-card${isActive ? ' destiny-slice-deck-card--active' : ''}${picked != null && picked !== i ? ' destiny-slice-deck-card--dim' : ''}`}
              style={{
                transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
                zIndex: picked === i ? 20 : 10 + i,
              }}
              disabled={disabled || picked != null}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handlePick(i)}
              aria-label={`${pickLabel} ${i + 1}`}
            >
              <span className="destiny-slice-deck-card-face" aria-hidden />
              <span className="destiny-slice-deck-card-sigil" aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
