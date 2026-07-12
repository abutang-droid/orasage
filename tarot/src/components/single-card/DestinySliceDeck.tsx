'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { DESTINY_SLICE_DECK_SIZE } from '@/lib/single-card/constants';

const CARD_BACK = '/cards/back.webp';

type Props = {
  disabled?: boolean;
  hint: string;
  pickLabel: string;
  onPick: (index: number) => void;
};

export function DestinySliceDeck({ disabled, hint, pickLabel, onPick }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePick = (index: number) => {
    if (disabled || picked != null) return;
    setPicked(index);
    onPick(index);
  };

  const updateActiveFromScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLButtonElement>('.destiny-slice-spread-card');
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  return (
    <div className="destiny-slice-deck">
      <p className="destiny-slice-deck-hint">{hint}</p>
      <div className="destiny-slice-deck-table">
        <div
          ref={scrollRef}
          className="destiny-slice-deck-spread"
          role="listbox"
          aria-label={pickLabel}
          onScroll={updateActiveFromScroll}
        >
          {Array.from({ length: DESTINY_SLICE_DECK_SIZE }, (_, i) => {
            const isPicked = picked === i;
            const isActive = activeIndex === i && picked == null;
            return (
              <button
                key={i}
                type="button"
                className={[
                  'destiny-slice-spread-card',
                  isPicked ? 'destiny-slice-spread-card--picked' : '',
                  picked != null && !isPicked ? 'destiny-slice-spread-card--dim' : '',
                  isActive ? 'destiny-slice-spread-card--active' : '',
                ].filter(Boolean).join(' ')}
                disabled={disabled || picked != null}
                onClick={() => handlePick(i)}
                aria-label={`${pickLabel} ${i + 1}`}
                aria-selected={isPicked}
              >
                <Image
                  src={CARD_BACK}
                  alt=""
                  width={80}
                  height={124}
                  className="destiny-slice-spread-card-img"
                  draggable={false}
                  priority={i < 6}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
