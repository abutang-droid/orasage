'use client';

import Image from 'next/image';

type TarotMiniCardProps = {
  src: string;
  alt?: string;
  className?: string;
  rotate?: number;
  glow?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

/** 装饰用小牌面 — 使用真实 /cards/*.webp 素材 */
export function TarotMiniCard({
  src,
  alt = '',
  className = '',
  rotate = 0,
  glow = false,
  width = 72,
  height = 106,
  priority = false,
}: TarotMiniCardProps) {
  return (
    <div className={`tarot-mini-card ${className}`.trim()} aria-hidden={!alt}>
      <div
        className={`tarot-mini-card-frame${glow ? ' tarot-mini-card-frame--glow' : ''}`}
        style={{ ['--card-rotate' as string]: `${rotate}deg` }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="tarot-mini-card-img"
          priority={priority}
          sizes={`${width}px`}
        />
      </div>
    </div>
  );
}
