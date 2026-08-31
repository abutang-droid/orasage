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
import { pdpContentLabelsFromT } from '@/lib/pdp-labels';
import { localizeFiveElement } from '@/lib/pdp-i18n';
import { fetchProductLinks } from '@/lib/product-links';
import { ProductAttachments } from '@/components/ProductAttachments';
import { ProductMediaLinks } from '@/components/ProductMediaLinks';
import { ProductDetailActions } from '@/components/ProductDetailActions';
import { ProductHeroGallery } from '@/components/ProductHeroGallery';
import { ProductInfoAccordion } from '@/components/ProductInfoAccordion';
import { ProductManifest } from '@/components/ProductManifest';
import { ProductSceneVideo } from '@/components/ProductSceneVideo';
import { ProductTestimonials } from '@/components/ProductTestimonials';
import { ProductUgcReviews } from '@/components/ProductUgcReviews';
import { ProductBrandClosure } from '@/components/ProductBrandClosure';
import { RelatedProducts } from '@/components/RelatedProducts';
import { TrustBar } from '@/components/TrustBar';
import { formatShopPrice, resolvePriceCents, currencyForLocale } from '@/lib/currency';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';
import { Disclaimer } from '@/lib/orasage-app-shell';

type PageProps = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sku } = await params;
  const locale = await getServerShopLocale();
  const t = await getTranslations('pdp');
  const [product, cmsPage] = await Promise.all([
    getProduct(sku, locale),
    fetchCmsProductPage(sku, locale),
  ]);
  if (!product) return { title: t('notFoundTitle') };
  const title = cmsPage?.seoTitle?.trim() || `${product.name} · OraSage Energy Shop`;
  const description = cmsPage?.seoDescription?.trim() || product.desc;
  const ogImage = cmsPage?.heroImages[0]?.url;
  return buildOrasageMetadata({
    title,
    description,
    canonical: `${ORASAGE_URLS.shop}/product/${encodeURIComponent(sku)}`,
    openGraph: {
      title,
      description,
      url: `${ORASAGE_URLS.shop}/product/${encodeURIComponent(sku)}`,
      image: ogImage,
    },
    ogImage,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { sku } = await params;
  if (sku === 'diy-bracelet') redirect('/diy');
  const locale = await getServerShopLocale();
  const [product, imageMap, cmsPage, testimonials, mediaLinks, ugcReviews, t, tc] = await Promise.all([
    getProduct(sku, locale),
    fetchProductImageMap(),
    fetchCmsProductPage(sku, locale),
    fetchProductTestimonials(sku, locale),
    fetchProductLinks(sku, locale),
    fetchUgcReviews(sku),
    getTranslations('pdp'),
    getTranslations('categories'),
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
  const labels = pdpContentLabelsFromT(t);
  const localizedElement = localizeFiveElement(product.element, locale);
  const rawContent = buildPdpContent(cmsPage?.sections ?? [], labels, locale);
  const localizedSpecs = (product.specs ?? []).map((s) => ({
    label: s.label,
    value: s.key === 'element' ? localizeFiveElement(s.value, locale) || s.value : s.value,
  }));
  const content = injectProductSpecs(rawContent, localizedSpecs, labels.specs);
  const relatedSkus = resolveRelatedCrystalSkus(product.sku, content.relatedSkus);
  const eyebrow =
    productEyebrow(product.sku, product.element, product.material, labels, localizedElement)
    ?? tc(product.category);
  const hasAccordion = content.accordions.length > 0;

  return (
    <main className="shop-page safe-bottom flex-1">
      <div className="shop-pdp shop-pdp--content">
        <Link href="/" className="shop-pdp-back shop-pdp-back--top">
          ← {t('backToShop')}
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
            <TrustBar locale={locale} />
            <ProductDetailActions product={product} />
            <Disclaimer variant="product" locale={locale} compact className="mt-3 mb-4" />
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

        <ProductUgcReviews sku={sku} reviews={ugcReviews} />

        <section className="shop-pdp-finale">
          <RelatedProducts skus={relatedSkus} title={content.relatedTitle} />
        </section>
      </div>
    </main>
  );
}
