'use client';

type Props = {
  src: string;
  poster?: string | null;
  autoplay?: boolean;
};

/** 静音循环背景视频（符合浏览器自动播放策略）；用户可通过 controls 暂停/播放 */
export function HomeHeroVideo({ src, poster, autoplay = true }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <video
        className="h-full w-full object-cover opacity-20 grayscale"
        src={src}
        poster={poster ?? undefined}
        autoPlay={autoplay}
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
      />
    </div>
  );
}
