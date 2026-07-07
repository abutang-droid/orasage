export function ProductSceneVideo({ src, productName }: { src: string; productName: string }) {
  return (
    <section className="shop-pdp-scene" aria-label={`${productName} 佩戴场景`}>
      <p className="shop-pdp-scene-eyebrow">佩戴场景 · In Scene</p>
      <video
        className="shop-pdp-scene-video"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        controls
      />
    </section>
  );
}
