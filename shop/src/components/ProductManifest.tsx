import type { ProductPageSection } from '@/lib/cms-product-page';
import { splitManifestQuote } from '@/lib/pdp-content-parser';

function manifestEyebrow(attribution?: string): { en: string; zh: string } {
  if (attribution?.includes('Read to Manifest')) {
    return { en: 'Read to Manifest', zh: '解读显化' };
  }
  if (attribution?.includes('Act to Manifest')) {
    return { en: 'Act to Manifest', zh: '行动显化' };
  }
  return { en: 'Wear to Manifest', zh: '佩戴显化' };
}

export function ProductManifest({ section }: { section: ProductPageSection }) {
  if (!section.quote) return null;

  const { english, chinese } = splitManifestQuote(section.quote);
  const eyebrow = manifestEyebrow(section.attribution);

  return (
    <section className="shop-pdp-manifest" aria-label={eyebrow.zh}>
      <p className="shop-pdp-manifest-eyebrow">
        {eyebrow.zh} · {eyebrow.en}
      </p>
      <blockquote className="shop-pdp-manifest-quote">
        {english ? <p className="shop-pdp-manifest-en">{english}</p> : null}
        {chinese ? <p className="shop-pdp-manifest-zh">{chinese}</p> : null}
      </blockquote>
    </section>
  );
}
