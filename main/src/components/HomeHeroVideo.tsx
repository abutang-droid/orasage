'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  poster?: string | null;
  autoplay?: boolean;
};

/** 静音循环背景视频；进视口后再挂载 src，减轻首屏带宽 */
export function HomeHeroVideo({ src, poster, autoplay = true }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: '100px 0px', threshold: 0.01 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !active) return;
    if (el.getAttribute('src') !== src) {
      el.src = src;
      el.load();
    }
    if (autoplay) {
      void el.play().catch(() => {
        /* ignore */
      });
    }
  }, [active, src, autoplay]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <video
        ref={videoRef}
        className="h-full w-full object-cover opacity-30"
        poster={poster ?? undefined}
        autoPlay={autoplay}
        muted
        loop
        playsInline
        preload="none"
        controls={false}
      />
    </div>
  );
}
