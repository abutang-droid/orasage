'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  poster?: string | null;
  autoplay?: boolean;
};

/** 静音循环背景视频；Reduced Motion 时不自动播放/循环（HOME-P3-01） */
export function HomeHeroVideo({ src, poster, autoplay = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (reduceMotion || !autoplay) {
      el.pause();
      el.removeAttribute('autoplay');
      return;
    }
    void el.play().catch(() => undefined);
  }, [reduceMotion, autoplay, src]);

  const shouldAutoplay = autoplay && !reduceMotion;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <video
        ref={videoRef}
        className="h-full w-full object-cover opacity-30"
        src={src}
        poster={poster ?? undefined}
        autoPlay={shouldAutoplay}
        muted
        loop={shouldAutoplay}
        playsInline
        preload="metadata"
        controls={false}
      />
    </div>
  );
}
