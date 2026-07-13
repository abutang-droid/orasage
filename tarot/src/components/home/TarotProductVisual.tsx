'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  BlessingDomeGlyph,
  DestinySliceGlyph,
  TrilogyNetworkGlyph,
} from '@/components/home/HomeTileGlyphs';

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

function TileGlyph({ variant }: { variant: TarotProductVisualProps['variant'] }) {
  if (variant === 'single') return <DestinySliceGlyph />;
  if (variant === 'three') return <TrilogyNetworkGlyph />;
  return <BlessingDomeGlyph />;
}

function TileInner({
  title,
  desc,
  cta,
  note,
  badges,
  featured,
  variant,
}: Pick<
  TarotProductVisualProps,
  'title' | 'desc' | 'cta' | 'note' | 'badges' | 'featured' | 'variant'
>) {
  return (
    <>
      <div className="home-tile-body">
        {badges && badges.length > 0 ? (
          <div className="home-tile-badges">
            {badges.map((b) => (
              <span
                key={b.key}
                className={`home-tile-badge${b.muted ? ' home-tile-badge--muted' : ''}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        ) : null}
        <h2 className="home-tile-title">{title}</h2>
        <p className="home-tile-desc">{desc}</p>
        {note ? <p className="home-tile-note">{note}</p> : null}
        <span className={`home-tile-cta${featured ? ' home-tile-cta--primary' : ''}`}>
          <span>{cta}</span>
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </span>
      </div>
      <div className="home-tile-art">
        <TileGlyph variant={variant} />
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
    'home-tile',
    featured ? 'home-tile--featured' : '',
    `home-tile--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        <TileInner
          title={title}
          desc={desc}
          cta={cta}
          note={note}
          badges={badges}
          featured={featured}
          variant={variant}
        />
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      <TileInner
        title={title}
        desc={desc}
        cta={cta}
        note={note}
        badges={badges}
        featured={featured}
        variant={variant}
      />
    </button>
  );
}
