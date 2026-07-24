import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getProduct } from '@/lib/products';
import { getServerShopLocale } from '@/lib/currency-server';
import { fetchProductImageMap } from '@/lib/cms-product-images';
import { fetchCmsProductPage } from '@/lib/cms-product-page';
import { fetchProductTestimonials } from '@/lib/cms-product-testimonials';
import { fetchUgcReviews } from '@/lib/ugc-reviews';
import { buildPdpContent, productEyebrow, resolveRelatedCrystalSkus, injectProductSpecs } from '@/lib/pdp-content';
import { fetchProductLinks } from '@/lib/product-links';
import { ProductAttachments } from '@/components/ProductAttachments';
import { ProductMediaLinks } from '@/components/ProductMediaLinks';
import { ProductDetailActions } from '@/components/ProductDetailActions';
import { ProductHeroGallery } from '@/components/ProductHeroGallery';
import { ProductInfoAccordion } from '@/components/ProductInfoAccordion';
import { ProductManifest } from '@/components/ProductManifest';
import { ProductAdvisorQuote } from '@/components/ProductAdvisorQuote';
import { ProductSceneVideo } from '@/components/ProductSceneVideo';
import { ProductTestimonials } from '@/components/ProductTestimonials';
import { ProductUgcReviews } from '@/components/ProductUgcReviews';
import { ProductBrandClosure } from '@/components/ProductBrandClosure';
import { RelatedProducts } from '@/components/RelatedProducts';
import { formatDualShopPrice } from '@/lib/currency';

type PageProps = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku } = await params;
  const locale = await getServerShopLocale();
  const t = await getTranslations('pdp');
  const [product, cmsPage] = await Promise.all([
    getProduct(sku, locale),
    fetchCmsProductPage(sku, locale),
  ]);
  if (!product) return { title: t('notFound') };
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
  const t = await getTranslations('pdp');
  const [product, imageMap, cmsPage, testimonials, mediaLinks, ugcReviews] = await Promise.all([
    getProduct(sku, locale),
    fetchProductImageMap(),
    fetchCmsProductPage(sku, locale),
    fetchProductTestimonials(sku, locale),
    fetchProductLinks(sku, locale),
    fetchUgcReviews(sku),
  ]);

  if (!product) notFound();

  const displayPrice = formatDualShopPrice({
    priceCents: product.priceCents,
    priceCentsUsd: product.priceCentsUsd,
  });
  const listThumbnail = imageMap.get(product.sku) ?? product.imageUrl ?? null;
  const subtitle = cmsPage?.subtitle?.trim();
  const rawContent = buildPdpContent(cmsPage?.sections ?? [], {
    productDetails: t('ui.productDetails'),
    energyDetails: t('ui.energyDetails'),
    reportDetails: t('ui.reportDetails'),
    serviceDetails: t('ui.serviceDetails'),
    story: t('ui.story'),
    deepDive: t('ui.deepDive'),
    more: t('ui.more'),
    specifications: t('ui.specifications'),
    guide: t('ui.guide'),
    guidePairing: t('ui.guidePairing'),
    guideUpgrade: t('ui.guideUpgrade'),
    faq: t('ui.faq'),
    related: t('ui.related'),
  });
  const content = injectProductSpecs(rawContent, product.specs ?? [], t('ui.specifications'));
  const relatedSkus = resolveRelatedCrystalSkus(product.sku, content.relatedSkus);
  const tc = await getTranslations('categories');
  const elementLabel =
    product.tags?.find((tag) => tag.groupCode === 'element' || tag.code.startsWith('element-'))
      ?.label
    ?? product.element;
  const eyebrow =
    productEyebrow(product.sku, elementLabel, product.material, (el, mat) =>
      t('crystalEyebrow', { element: el, material: mat }),
    )
    ?? tc(product.category);
  const hasAccordion = content.accordions.length > 0;

  return (
    <main className="shop-page safe-bottom flex-1">
      <div className="shop-pdp shop-pdp--content">
        <Link href="/" className="shop-pdp-back shop-pdp-back--top">
          {t('backToShop')}
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
            {subtitle ? (
              <p className="shop-pdp-english-subtitle">{subtitle}</p>
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

        {content.quote ? <ProductAdvisorQuote section={content.quote} /> : null}

        <ProductAttachments items={product.attachments ?? []} />

        <ProductMediaLinks items={mediaLinks} />

        <ProductBrandClosure element={product.element} sku={product.sku} category={product.category} />

        <ProductTestimonials items={testimonials} />

        <ProductUgcReviews sku={sku} reviews={ugcReviews} />

        <section className="shop-pdp-finale">
          <RelatedProducts skus={relatedSkus} title={content.relatedTitle} />
        </section>
      </div>
    </main>
  );
}
