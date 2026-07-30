import { getTranslations } from 'next-intl/server';

export async function ProductSceneVideo({
  src,
  productName,
}: {
  src: string;
  productName: string;
}) {
  const t = await getTranslations('pdp');

  return (
    <section className="shop-pdp-scene" aria-label={t('sceneAria', { name: productName })}>
      <p className="shop-pdp-scene-eyebrow">{t('sceneEyebrow')}</p>
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
