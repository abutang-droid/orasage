'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 购买区下方场景视频：进入视口后再挂载 src，避免与主图视频抢带宽。
 */
export function ProductSceneVideo({ src, productName }: { src: string; productName: string }) {
  const rootRef = useRef<HTMLElement>(null);
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
      { rootMargin: '200px 0px', threshold: 0.01 },
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
    void el.play().catch(() => {
      /* ignore autoplay block */
    });
  }, [active, src]);

  return (
    <section ref={rootRef} className="shop-pdp-scene" aria-label={`${productName} 佩戴场景`}>
      <p className="shop-pdp-scene-eyebrow">佩戴场景 · In Scene</p>
      <video
        ref={videoRef}
        className="shop-pdp-scene-video"
        muted
        loop
        playsInline
        controls
        preload="none"
      />
    </section>
  );
}
