import { getLocale } from 'next-intl/server';
import type { ProductPageSection } from '@/lib/cms-product-page';
import { pickLocaleQuoteText } from '@/lib/pdp-content-parser';

/** 推荐语：CMS 双语正文按页面语言只展示一侧 */
export async function ProductAdvisorQuote({ section }: { section: ProductPageSection }) {
  if (!section.quote?.trim()) return null;

  const locale = await getLocale();
  const text = pickLocaleQuoteText(section.quote, locale);
  if (!text.trim()) return null;

  // 署名含 Manifest 的走显化模块；此处仅普通推荐语。双语署名取当前语言一侧。
  const attribution = section.attribution?.trim()
    ? pickLocaleQuoteText(section.attribution.replace(/\s*·\s*/g, '\n\n'), locale)
    : '';

  return (
    <section className="shop-pdp-advisor">
      <blockquote className="shop-pdp-quote">
        <p>{text}</p>
        {attribution ? (
          <footer className="shop-pdp-quote-footer">— {attribution}</footer>
        ) : null}
      </blockquote>
    </section>
  );
}
