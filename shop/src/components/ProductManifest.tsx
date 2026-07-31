import { getTranslations } from 'next-intl/server';
import type { ProductPageSection } from '@/lib/cms-product-page';
import { splitManifestQuote } from '@/lib/pdp-content-parser';
import { getServerShopLocale } from '@/lib/currency-server';

function manifestKey(attribution?: string): 'wear' | 'read' | 'act' {
  if (attribution?.includes('Read to Manifest')) return 'read';
  if (attribution?.includes('Act to Manifest')) return 'act';
  return 'wear';
}

export async function ProductManifest({ section }: { section: ProductPageSection }) {
  if (!section.quote) return null;

  const locale = await getServerShopLocale();
  const t = await getTranslations('pdp.manifest');
  const { english, chinese } = splitManifestQuote(section.quote);
  const eyebrow = t(manifestKey(section.attribution));
  const showZh = locale.startsWith('zh');
  const primary = showZh ? (chinese || english) : (english || chinese);
  const secondary = showZh ? (english && chinese ? english : '') : '';

  return (
    <section className="shop-pdp-manifest" aria-label={eyebrow}>
      <p className="shop-pdp-manifest-eyebrow">{eyebrow}</p>
      <blockquote className="shop-pdp-manifest-quote">
        {primary ? (
          <p className={showZh ? 'shop-pdp-manifest-zh' : 'shop-pdp-manifest-en'}>{primary}</p>
        ) : null}
        {secondary ? <p className="shop-pdp-manifest-en">{secondary}</p> : null}
      </blockquote>
    </section>
  );
}
