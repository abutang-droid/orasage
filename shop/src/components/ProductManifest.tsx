import type { ProductPageSection } from '@/lib/cms-product-page';
import { splitManifestQuote } from '@/lib/pdp-content-parser';

export function ProductManifest({ section }: { section: ProductPageSection }) {
  if (!section.quote) return null;

  const { english, chinese } = splitManifestQuote(section.quote);

  return (
    <section className="shop-pdp-manifest" aria-label="佩戴显化">
      <p className="shop-pdp-manifest-eyebrow">佩戴显化 · Wear to Manifest</p>
      <blockquote className="shop-pdp-manifest-quote">
        {english ? <p className="shop-pdp-manifest-en">{english}</p> : null}
        {chinese ? <p className="shop-pdp-manifest-zh">{chinese}</p> : null}
      </blockquote>
    </section>
  );
}
