import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminUser, getAdminToken, loginUrl } from '@/lib/auth';
import { getProducts, getTags, getCategories, getProductLinks, getBillingSlots } from '@/lib/api';
import { fetchAdminProductImageMap } from '@/lib/cms-product-images';
import { fetchCmsProductPageStatusMap } from '@/lib/cms-product-pages';
import { getCmsProductPageDoc } from '@/lib/cms-content-api';
import { resolveCmsMediaUrl } from '@/lib/cms-media-utils';
import { saveProductMediaAction } from '@/app/content-actions';
import { ProductEditForm } from '@/components/ProductEditForm';
import { ProductLinksPanel } from '@/components/ProductLinksPanel';
import { ProductMediaPanel } from '@/components/ProductMediaPanel';
import { ProductDeletePanel } from '@/components/ProductDeletePanel';
import { ProductBillingSlotsPanel } from '@/components/ProductBillingSlotsPanel';

type PageProps = {
  params: Promise<{ sku: string }>;
  searchParams?: Promise<{ image_err?: string; links?: string; save_err?: string; media_err?: string; media_ok?: string }>;
};

export default async function ProductEditPage({ params, searchParams }: PageProps) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());
  const token = await getAdminToken();

  const { sku: rawSku } = await params;
  const sku = decodeURIComponent(rawSku);
  const sp = (await searchParams) ?? {};

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  let tagData: Awaited<ReturnType<typeof getTags>> = { groups: [], tags: [] };
  let categories: Awaited<ReturnType<typeof getCategories>>['categories'] = [];
  let links: Awaited<ReturnType<typeof getProductLinks>>['links'] = [];
  let billingSlots: Awaited<ReturnType<typeof getBillingSlots>>['slots'] = [];
  let productImageMap = new Map<string, string>();
  let productPageStatusMap = new Map<string, 'published' | 'draft' | 'none'>();

  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/products/edit]', err);
  }
  try {
    tagData = await getTags();
  } catch (err) {
    console.error('[admin/tags]', err);
  }
  try {
    ({ categories } = await getCategories());
  } catch (err) {
    console.error('[admin/categories]', err);
  }
  try {
    ({ links } = await getProductLinks(sku));
  } catch (err) {
    console.error('[admin/product-links]', err);
  }
  try {
    ({ slots: billingSlots } = await getBillingSlots());
  } catch (err) {
    console.error('[admin/billing-slots]', err);
  }
  try {
    productImageMap = await fetchAdminProductImageMap();
  } catch (err) {
    console.error('[admin/product-images]', err);
  }
  try {
    productPageStatusMap = await fetchCmsProductPageStatusMap();
  } catch (err) {
    console.error('[admin/product-pages]', err);
  }

  const product = products.find((p) => p.sku === sku);
  if (!product) notFound();

  let cmsDoc = null;
  if (token) {
    try {
      cmsDoc = await getCmsProductPageDoc(sku, 'zh-CN', token);
    } catch (err) {
      console.error('[admin/products/edit cms]', err);
    }
  }

  const heroRows = (cmsDoc?.heroImages ?? [])
    .map((row) => ({
      mediaId: typeof row.image === 'number' ? row.image : row.image?.id,
      url: resolveCmsMediaUrl(row.image),
      alt: row.alt ?? '',
      sort: row.sort ?? 0,
    }))
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  return (
    <div className="admin-page">
      <header className="page-header">
        <p className="muted">
          <Link href="/products">← 返回商品列表</Link>
        </p>
        <h1>编辑商品 · {product.name}</h1>
        <p className="muted">
          SKU <code>{product.sku}</code> · 属性/价格在下方表单；媒体资源独立保存。
        </p>
      </header>

      {sp.save_err ? (
        <p className="muted panel-notice panel-notice--error">
          保存失败：{decodeURIComponent(sp.save_err)}
        </p>
      ) : null}
      {sp.media_err ? (
        <p className="muted panel-notice panel-notice--error">
          媒体保存失败：{decodeURIComponent(sp.media_err)}
        </p>
      ) : null}
      {sp.media_ok ? (
        <p className="muted panel-notice">媒体资源已保存。</p>
      ) : null}
      {sp.image_err ? (
        <p className="muted panel-notice panel-notice--error">
          商品信息已保存，但主图上传失败：{decodeURIComponent(sp.image_err)}
        </p>
      ) : null}
      {sp.links === 'ok' ? (
        <p className="muted panel-notice">关联页面已保存。</p>
      ) : null}

      <section className="panel">
        <h2>媒体资源</h2>
        <ProductMediaPanel
          sku={product.sku}
          catalogImageUrl={productImageMap.get(product.sku)}
          pageStatus={productPageStatusMap.get(product.sku) ?? 'none'}
          heroRows={heroRows}
          galleryVideoUrl={cmsDoc?.galleryVideoUrl}
          sceneVideoUrl={cmsDoc?.sceneVideoUrl}
          saveMediaAction={saveProductMediaAction}
        />
      </section>

      <section className="panel">
        <h2>商品信息</h2>
        <ProductEditForm
          mode="edit"
          product={product}
          pageStatus={productPageStatusMap.get(product.sku) ?? 'none'}
          tagData={tagData}
          categories={categories}
          catalog={products}
          hideMediaTab
        />
      </section>

      <section className="panel">
        <h2>关联页面（媒体与用户报道）</h2>
        <ProductLinksPanel sku={product.sku} links={links} />
      </section>

      <section className="panel">
        <h2>计费槽位引用</h2>
        <ProductBillingSlotsPanel sku={product.sku} slots={billingSlots} />
      </section>

      <section className="panel panel--danger">
        <h2>下架商品</h2>
        <ProductDeletePanel sku={product.sku} name={product.name} active={product.active} />
      </section>
    </div>
  );
}
