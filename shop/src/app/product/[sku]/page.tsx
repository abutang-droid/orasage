import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, categoryLabels } from '@/lib/products';
import { getServerShopLocale } from '@/lib/currency-server';
import { fetchProductImageMap } from '@/lib/cms-product-images';
import { fetchCmsProductPage } from '@/lib/cms-product-page';
import { fetchProductTestimonials } from '@/lib/cms-product-testimonials';
import { ProductDetailActions } from '@/components/ProductDetailActions';
import { ProductHeroGallery } from '@/components/ProductHeroGallery';
import { ProductPageSections } from '@/components/ProductPageSections';
import { ProductTestimonials } from '@/components/ProductTestimonials';
import { formatShopPrice, resolvePriceCents, currencyForLocale } from '@/lib/currency';

type PageProps = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku } = await params;
  const locale = await getServerShopLocale();
  const [product, cmsPage] = await Promise.all([
    getProduct(sku, locale),
    fetchCmsProductPage(sku, 'zh-CN'),
  ]);
  if (!product) return { title: '商品不存在' };
  const title = cmsPage?.seoTitle?.trim() || `${product.name} · OraSage Energy Shop`;
  const description = cmsPage?.seoDescription?.trim() || product.desc;
  const ogImage = cmsPage?.heroImages[0]?.url;
  return {
    title,
    description,
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { sku } = await params;
  const locale = await getServerShopLocale();
  const [product, imageMap, cmsPage, testimonials] = await Promise.all([
    getProduct(sku, locale),
    fetchProductImageMap(),
    fetchCmsProductPage(sku, 'zh-CN'),
    fetchProductTestimonials(sku, 'zh-CN'),
  ]);

  if (!product) notFound();

  const currency = currencyForLocale(locale);
  const displayCents = product.priceCentsResolved
    ?? resolvePriceCents(
      { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
      currency,
    );
  const displayPrice = product.priceDisplay ?? formatShopPrice(displayCents, currency);
  const listThumbnail = imageMap.get(product.sku) ?? product.imageUrl ?? null;
  const englishSubtitle = cmsPage?.subtitle?.trim();
  const hasRichContent = Boolean(cmsPage?.sections.length || cmsPage?.heroImages.length);

  return (
    <main className="shop-page safe-bottom flex-1">
      <div className="shop-pdp shop-pdp--content">
        <Link href="/" className="shop-pdp-back shop-pdp-back--top">
          ← 返回商城
        </Link>

        <div className="shop-pdp-hero-grid">
          <div className="shop-pdp-media">
            <ProductHeroGallery
              images={cmsPage?.heroImages ?? []}
              productName={product.name}
              fallbackUrl={listThumbnail}
            />
          </div>

          <div className="shop-pdp-info">
            <p className="shop-pdp-category">{categoryLabels[product.category]}</p>
            <h1 className="shop-pdp-title">{product.name}</h1>
            {englishSubtitle ? (
              <p className="shop-pdp-english-subtitle">{englishSubtitle}</p>
            ) : null}
            {product.element ? (
              <p className="shop-pdp-element">五行 · {product.element}</p>
            ) : null}
            {product.desc ? <p className="shop-pdp-desc">{product.desc}</p> : null}
            <p className="shop-pdp-price">{displayPrice}</p>
            <ProductDetailActions product={product} />
          </div>
        </div>

        {hasRichContent ? <ProductPageSections sections={cmsPage?.sections ?? []} /> : null}

        {!hasRichContent && product.desc ? (
          <section className="shop-pdp-section shop-pdp-section--prose">
            <h2 className="shop-pdp-section-title">商品说明</h2>
            <div className="shop-pdp-section-body">{product.desc}</div>
          </section>
        ) : null}

        <ProductTestimonials items={testimonials} />
      </div>
    </main>
  );
}
