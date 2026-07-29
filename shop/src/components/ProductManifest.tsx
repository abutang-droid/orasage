import { getLocale, getTranslations } from 'next-intl/server';
import type { ProductPageSection } from '@/lib/cms-product-page';
import { pickLocaleQuoteText } from '@/lib/pdp-content-parser';

function manifestEyebrowKey(attribution?: string): 'wear' | 'read' | 'act' {
  if (attribution?.includes('Read to Manifest')) return 'read';
  if (attribution?.includes('Act to Manifest')) return 'act';
  return 'wear';
}

export async function ProductManifest({ section }: { section: ProductPageSection }) {
  if (!section.quote) return null;

  const [locale, t] = await Promise.all([getLocale(), getTranslations('pdp.manifest')]);
  const text = pickLocaleQuoteText(section.quote, locale);
  if (!text.trim()) return null;

  const eyebrow = t(manifestEyebrowKey(section.attribution));
  const preferZh = locale === 'zh-CN' || locale === 'zh-TW' || locale.startsWith('zh');

  return (
    <section className="shop-pdp-manifest" aria-label={eyebrow}>
      <p className="shop-pdp-manifest-eyebrow">{eyebrow}</p>
      <blockquote className="shop-pdp-manifest-quote">
        <p className={preferZh ? 'shop-pdp-manifest-zh' : 'shop-pdp-manifest-en'}>{text}</p>
      </blockquote>
    </section>
  );
}
