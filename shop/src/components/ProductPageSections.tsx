import Link from 'next/link';
import type { ProductPageSection } from '@/lib/cms-product-page';
import type { Product } from '@/lib/products';
import { categoryLabels } from '@/lib/products';
import { ProductImage } from '@/components/ProductImage';
import { formatShopPrice, resolvePriceCents } from '@/lib/currency';
import type { ShopCurrency } from '@/lib/currency';

export function ProductPageSections({ sections }: { sections: ProductPageSection[] }) {
  if (!sections.length) return null;

  return (
    <div className="shop-pdp-sections">
      {sections.map((section, index) => {
        if (section.type === 'richText' && section.body) {
          return (
            <section key={index} className="shop-pdp-section shop-pdp-section--prose">
              <div className="shop-pdp-section-body">{section.body}</div>
            </section>
          );
        }

        if (section.type === 'specList' && section.specItems?.length) {
          return (
            <section key={index} className="shop-pdp-section">
              {section.title ? <h2 className="shop-pdp-section-title">{section.title}</h2> : null}
              <dl className="shop-pdp-spec-list">
                {section.specItems.map((item) => (
                  <div key={`${item.label}-${item.value}`} className="shop-pdp-spec-row">
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        }

        if (section.type === 'guide' && (section.title || section.body)) {
          return (
            <section key={index} className="shop-pdp-section">
              {section.title ? <h2 className="shop-pdp-section-title">{section.title}</h2> : null}
              {section.body ? <div className="shop-pdp-section-body">{section.body}</div> : null}
            </section>
          );
        }

        if (section.type === 'quote' && section.quote) {
          const isManifest = section.attribution?.includes('Wear to Manifest');
          return (
            <section
              key={index}
              className={`shop-pdp-section shop-pdp-section--quote${isManifest ? ' shop-pdp-section--manifest' : ''}`}
            >
              {isManifest ? (
                <p className="shop-pdp-manifest-label">{section.attribution}</p>
              ) : null}
              <blockquote className="shop-pdp-quote">
                <p>{section.quote}</p>
                {!isManifest && section.attribution ? (
                  <footer className="shop-pdp-quote-footer">— {section.attribution}</footer>
                ) : null}
              </blockquote>
            </section>
          );
        }

        if (section.type === 'faq' && section.faqItems?.length) {
          return (
            <section key={index} className="shop-pdp-section">
              {section.title ? <h2 className="shop-pdp-section-title">{section.title}</h2> : null}
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
    <section className="shop-pdp-section">
      <h2 className="shop-pdp-section-title">{title || '相关商品'}</h2>
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
