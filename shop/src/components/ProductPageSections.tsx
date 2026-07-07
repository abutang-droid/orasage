import Link from 'next/link';
import type { ProductPageSection } from '@/lib/cms-product-page';
import type { Product } from '@/lib/products';
import { categoryLabels } from '@/lib/products';
import { splitManifestQuote } from '@/lib/pdp-content-parser';
import { PdpRichText } from '@/components/PdpRichText';
import { ProductImage } from '@/components/ProductImage';
import { formatShopPrice, resolvePriceCents } from '@/lib/currency';
import type { ShopCurrency } from '@/lib/currency';

function sectionCardClass(variant?: 'default' | 'story' | 'manifest' | 'commitment') {
  const base = 'shop-pdp-section shop-pdp-block';
  if (variant === 'story') return `${base} shop-pdp-block--story`;
  if (variant === 'manifest') return `${base} shop-pdp-block--manifest`;
  if (variant === 'commitment') return `${base} shop-pdp-block--commitment`;
  return base;
}

function inferRichVariant(body: string, index: number): 'default' | 'story' {
  if (body.includes('灵性图谱') || body.includes('──')) return 'story';
  return index === 0 ? 'default' : 'story';
}

export function ProductPageSections({ sections }: { sections: ProductPageSection[] }) {
  if (!sections.length) return null;

  let richIndex = 0;

  return (
    <div className="shop-pdp-story">
      {sections.map((section, index) => {
        if (section.type === 'richText' && section.body) {
          const variant = inferRichVariant(section.body, richIndex);
          richIndex += 1;
          return (
            <section key={index} className={sectionCardClass(variant)}>
              <PdpRichText body={section.body} />
            </section>
          );
        }

        if (section.type === 'specList' && section.specItems?.length) {
          return (
            <section key={index} className={sectionCardClass('commitment')}>
              {section.title ? (
                <h2 className="shop-pdp-block-heading">{section.title}</h2>
              ) : null}
              <ul className="shop-pdp-commitment-list">
                {section.specItems.map((item) => (
                  <li key={`${item.label}-${item.value}`} className="shop-pdp-commitment-item">
                    <span className="shop-pdp-commitment-label">{item.label}</span>
                    <p className="shop-pdp-commitment-value">{item.value}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        if (section.type === 'guide' && (section.title || section.body)) {
          return (
            <section key={index} className={sectionCardClass()}>
              {section.title ? (
                <h2 className="shop-pdp-block-heading">{section.title}</h2>
              ) : null}
              {section.body ? <PdpRichText body={section.body} /> : null}
            </section>
          );
        }

        if (section.type === 'quote' && section.quote) {
          const isManifest = section.attribution?.includes('Wear to Manifest');
          const { english, chinese } = splitManifestQuote(section.quote);

          return (
            <section
              key={index}
              className={sectionCardClass(isManifest ? 'manifest' : 'default')}
            >
              {isManifest ? (
                <>
                  <p className="shop-pdp-manifest-eyebrow">佩戴显化</p>
                  <p className="shop-pdp-manifest-eyebrow-en">Wear to Manifest</p>
                  <blockquote className="shop-pdp-manifest-quote">
                    {english ? (
                      <p className="shop-pdp-manifest-en">{english}</p>
                    ) : null}
                    {chinese ? (
                      <p className="shop-pdp-manifest-zh">{chinese}</p>
                    ) : null}
                  </blockquote>
                </>
              ) : (
                <blockquote className="shop-pdp-quote">
                  <p>{section.quote}</p>
                  {section.attribution ? (
                    <footer className="shop-pdp-quote-footer">— {section.attribution}</footer>
                  ) : null}
                </blockquote>
              )}
            </section>
          );
        }

        if (section.type === 'faq' && section.faqItems?.length) {
          return (
            <section key={index} className={sectionCardClass()}>
              {section.title ? (
                <h2 className="shop-pdp-block-heading">{section.title}</h2>
              ) : null}
              <div className="shop-pdp-faq-list">
                {section.faqItems.map((item) => (
                  <details key={item.question} className="shop-pdp-faq-item">
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === 'relatedSkus' && section.relatedSkus?.length) {
          return (
            <RelatedProductsBlock key={index} skus={section.relatedSkus} title={section.title} />
          );
        }

        return null;
      })}
    </div>
  );
}

async function RelatedProductsBlock({ skus, title }: { skus: string[]; title?: string }) {
  const { fetchProducts } = await import('@/lib/products');
  const { fetchProductImageMap } = await import('@/lib/cms-product-images');
  const { getServerShopLocale } = await import('@/lib/currency-server');

  const locale = await getServerShopLocale();
  const [products, imageMap] = await Promise.all([fetchProducts(locale), fetchProductImageMap()]);
  const related = skus
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 6);

  if (!related.length) return null;

  const currency = (await import('@/lib/currency')).currencyForLocale(locale);

  return (
    <section className="shop-pdp-section shop-pdp-related">
      <h2 className="shop-pdp-block-heading">{title || '能量搭配'}</h2>
      <div className="shop-pdp-related-grid">
        {related.map((product) => (
          <RelatedProductCard
            key={product.sku}
            product={product}
            imageUrl={imageMap.get(product.sku) ?? product.imageUrl ?? null}
            currency={currency}
          />
        ))}
      </div>
    </section>
  );
}

function RelatedProductCard({
  product,
  imageUrl,
  currency,
}: {
  product: Product;
  imageUrl: string | null;
  currency: ShopCurrency;
}) {
  const displayCents =
    product.priceCentsResolved ??
    resolvePriceCents(
      { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
      currency,
    );
  const displayPrice = product.priceDisplay ?? formatShopPrice(displayCents, currency);

  return (
    <Link href={`/product/${encodeURIComponent(product.sku)}`} className="shop-pdp-related-card">
      <ProductImage
        sku={product.sku}
        name={product.name}
        category={product.category}
        imageUrl={imageUrl}
        className="shop-pdp-related-image"
      />
      <span className="shop-pdp-related-category">{categoryLabels[product.category]}</span>
      <span className="shop-pdp-related-name">{product.name}</span>
      <span className="shop-pdp-related-price">{displayPrice}</span>
    </Link>
  );
}
