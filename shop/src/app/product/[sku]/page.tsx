import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, categoryLabels } from '@/lib/products';
import { getServerShopLocale } from '@/lib/currency-server';
import { fetchProductImageMap } from '@/lib/cms-product-images';
import { fetchCmsProductPage } from '@/lib/cms-product-page';
import { fetchProductTestimonials } from '@/lib/cms-product-testimonials';
import { buildPdpContent, productEyebrow, resolveRelatedCrystalSkus, injectProductSpecs } from '@/lib/pdp-content';
import { fetchProductLinks } from '@/lib/product-links';
import { ProductAttachments } from '@/components/ProductAttachments';
import { ProductMediaLinks } from '@/components/ProductMediaLinks';
import { ProductDetailActions } from '@/components/ProductDetailActions';
import { ProductHeroGallery } from '@/components/ProductHeroGallery';
import { ProductInfoAccordion } from '@/components/ProductInfoAccordion';
import { ProductManifest } from '@/components/ProductManifest';
import { ProductSceneVideo } from '@/components/ProductSceneVideo';
import { ProductTestimonials } from '@/components/ProductTestimonials';
import { ProductBrandClosure } from '@/components/ProductBrandClosure';
import { RelatedProducts } from '@/components/RelatedProducts';
import { formatShopPrice, resolvePriceCents, currencyForLocale } from '@/lib/currency';

type PageProps = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku } = await params;
  const locale = await getServerShopLocale();
  const [product, cmsPage] = await Promise.all([
    getProduct(sku, locale),
    fetchCmsProductPage(sku, locale),
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
  if (sku === 'diy-bracelet') redirect('/diy');
  const locale = await getServerShopLocale();
  const [product, imageMap, cmsPage, testimonials, mediaLinks] = await Promise.all([
    getProduct(sku, locale),
    fetchProductImageMap(),
    fetchCmsProductPage(sku, locale),
    fetchProductTestimonials(sku, locale),
    fetchProductLinks(sku, locale),
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
  const rawContent = buildPdpContent(cmsPage?.sections ?? []);
  const specTitle = locale.startsWith('zh') ? '商品规格' : 'Specifications';
  const content = injectProductSpecs(rawContent, product.specs ?? [], specTitle);
  const relatedSkus = resolveRelatedCrystalSkus(product.sku, content.relatedSkus);
  const eyebrow = productEyebrow(product.sku, product.element, product.material) ?? categoryLabels[product.category];
  const hasAccordion = content.accordions.length > 0;

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
              videoUrl={cmsPage?.galleryVideoUrl}
            />
          </div>

          <div className="shop-pdp-info">
            <p className="shop-pdp-category">{eyebrow}</p>
            <h1 className="shop-pdp-title">{product.name}</h1>
            {englishSubtitle ? (
              <p className="shop-pdp-english-subtitle">{englishSubtitle}</p>
            ) : null}
            <p className="shop-pdp-price">{displayPrice}</p>
            <ProductDetailActions product={product} />
            {hasAccordion ? <ProductInfoAccordion items={content.accordions} /> : null}
            {!hasAccordion && product.desc ? (
              <p className="shop-pdp-desc">{product.desc}</p>
            ) : null}
          </div>
        </div>

        {content.manifest ? <ProductManifest section={content.manifest} /> : null}

        {cmsPage?.sceneVideoUrl ? (
          <ProductSceneVideo src={cmsPage.sceneVideoUrl} productName={product.name} />
        ) : null}

        {content.quote?.quote ? (
          <section className="shop-pdp-advisor">
            <blockquote className="shop-pdp-quote">
              <p>{content.quote.quote}</p>
              {content.quote.attribution ? (
                <footer className="shop-pdp-quote-footer">— {content.quote.attribution}</footer>
              ) : null}
            </blockquote>
          </section>
        ) : null}

        <ProductAttachments items={product.attachments ?? []} />

        <ProductMediaLinks items={mediaLinks} />

        <ProductBrandClosure element={product.element} sku={product.sku} category={product.category} />

        <ProductTestimonials items={testimonials} />

        <section className="shop-pdp-finale">
          <RelatedProducts skus={relatedSkus} title={content.relatedTitle} />
        </section>
      </div>
    </main>
  );
}
