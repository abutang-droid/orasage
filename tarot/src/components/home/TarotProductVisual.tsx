'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TarotMiniCard } from '@/components/home/TarotMiniCard';

type Badge = {
  key: string;
  label: string;
  muted?: boolean;
};

type TarotProductVisualProps = {
  href?: string;
  onClick?: () => void;
  title: string;
  desc: string;
  cta: string;
  note?: string;
  badges?: Badge[];
  featured?: boolean;
  variant: 'single' | 'daily' | 'three' | 'temple';
  className?: string;
};

function TrilogyIcon() {
  return (
    <div className="trilogy-home-icon" aria-hidden>
      <span className="trilogy-home-link trilogy-home-link--1" />
      <span className="trilogy-home-link trilogy-home-link--2" />
      <span className="trilogy-home-node trilogy-home-node--1" />
      <span className="trilogy-home-node trilogy-home-node--2" />
      <span className="trilogy-home-node trilogy-home-node--3" />
      <span className="trilogy-home-axis" />
    </div>
  );
}

function DestinySliceIcon() {
  return (
    <div className="destiny-slice-home-icon" aria-hidden>
      <span className="destiny-slice-home-icon-ring destiny-slice-home-icon-ring--outer" />
      <span className="destiny-slice-home-icon-ring destiny-slice-home-icon-ring--inner" />
      <span className="destiny-slice-home-icon-slice" />
      <span className="destiny-slice-home-icon-glow" />
      <span className="destiny-slice-home-icon-dot destiny-slice-home-icon-dot--1" />
      <span className="destiny-slice-home-icon-dot destiny-slice-home-icon-dot--2" />
      <span className="destiny-slice-home-icon-dot destiny-slice-home-icon-dot--3" />
    </div>
  );
}

function CardScene({ variant }: { variant: TarotProductVisualProps['variant'] }) {
  if (variant === 'single') {
    return (
      <div className="tarot-product-scene tarot-product-scene--destiny-slice">
        <DestinySliceIcon />
      </div>
    );
  }

  if (variant === 'daily') {
    return (
      <div className="tarot-product-scene tarot-product-scene--daily">
        <div className="tarot-product-scene-orbit" aria-hidden />
        <TarotMiniCard src="/cards/19.webp" className="tarot-product-scene-card tarot-product-scene-card--daily" rotate={6} glow />
        <TarotMiniCard src="/cards/back.webp" className="tarot-product-scene-card tarot-product-scene-card--daily-back" rotate={-14} />
      </div>
    );
  }

  if (variant === 'three') {
    return (
      <div className="tarot-product-scene tarot-product-scene--trilogy">
        <TrilogyIcon />
      </div>
    );
  }

  return (
    <div className="tarot-product-scene tarot-product-scene--temple">
      <div className="tarot-product-scene-incense" aria-hidden />
      <TarotMiniCard src="/cards/17.webp" className="tarot-product-scene-card tarot-product-scene-card--temple" rotate={-6} glow />
    </div>
  );
}

function TileInner({
  title,
  desc,
  cta,
  note,
  badges,
  variant,
}: Pick<TarotProductVisualProps, 'title' | 'desc' | 'cta' | 'note' | 'badges' | 'variant'>) {
  return (
    <>
      <div className="tarot-product-visual-art">
        <CardScene variant={variant} />
      </div>
      <div className="tarot-product-visual-body">
        {badges && badges.length > 0 ? (
          <div className="tarot-product-visual-badges">
            {badges.map((b) => (
              <span
                key={b.key}
                className={`tarot-product-visual-badge${b.muted ? ' tarot-product-visual-badge--muted' : ''}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        ) : null}
        <h2 className="tarot-product-visual-title">{title}</h2>
        <p className="tarot-product-visual-desc">{desc}</p>
        {note ? <p className="tarot-product-visual-note">{note}</p> : null}
        <span className="tarot-product-visual-cta">
          {cta ? <span>{cta}</span> : null}
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </span>
      </div>
    </>
  );
}

export function TarotProductVisual({
  href,
  onClick,
  title,
  desc,
  cta,
  note,
  badges,
  featured = false,
  variant,
  className = '',
}: TarotProductVisualProps) {
  const classes = [
    'tarot-product-visual',
    featured ? 'tarot-product-visual--featured' : '',
    `tarot-product-visual--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        <TileInner title={title} desc={desc} cta={cta} note={note} badges={badges} variant={variant} />
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      <TileInner title={title} desc={desc} cta={cta} note={note} badges={badges} variant={variant} />
    </button>
  );
}
