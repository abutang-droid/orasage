import Link from 'next/link';
import { getAdminUser, loginUrl } from '@/lib/auth';
import { getHomepageProducts, getProducts, getTags, getCategories } from '@/lib/api';
import { saveHomepageProductsAction } from '@/app/actions';
import { fetchAdminProductImageMap } from '@/lib/cms-product-images';
import { fetchCmsProductPageStatusMap } from '@/lib/cms-product-pages';
import { AdminSubmitButton } from '@/components/AdminButton';
import { ProductEditForm } from '@/components/ProductEditForm';
import { ProductListTable } from '@/components/ProductListTable';
import { redirect } from 'next/navigation';

const HOMEPAGE_SLOTS = 6;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    image_err?: string;
    sku?: string;
    save_err?: string;
  }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  let homepageSkus: string[] = [];
  let tagData: Awaited<ReturnType<typeof getTags>> = { groups: [], tags: [] };
  let categories: Awaited<ReturnType<typeof getCategories>>['categories'] = [];
  let productImageMap = new Map<string, string>();
  let productPageStatusMap = new Map<string, 'published' | 'draft' | 'none'>();
  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/products]', err);
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
  try {
    ({ skus: homepageSkus } = await getHomepageProducts());
  } catch (err) {
    console.error('[admin/homepage-products]', err);
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

  const publicProducts = products.filter((p) => p.active && p.visibility === 'public');
  const rows = products.map((p) => ({
    ...p,
    imageUrl: productImageMap.get(p.sku) ?? null,
    pageStatus: productPageStatusMap.get(p.sku) ?? ('none' as const),
  }));

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商品管理</h1>
        <p className="muted">
          独立商城目录：结构化属性、标签、可见性、库存在本页维护；详情长内容与多图在 CMS；
          命理 App 付费/推荐配置移至<Link href="/billing">「应用计费」</Link>。
        </p>
      </header>

      {sp.save_err ? (
        <p className="muted panel-notice panel-notice--error">
          保存失败：{decodeURIComponent(sp.save_err)}
        </p>
      ) : null}

      {sp.image_err ? (
        <p className="muted panel-notice panel-notice--error">
          商品 {sp.sku ? <code>{sp.sku}</code> : null} 信息已保存，但主图上传失败：{decodeURIComponent(sp.image_err)}
        </p>
      ) : null}

      <section className="panel">
        <h2>概况</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          共 {products.length} 个 SKU（公开 {publicProducts.length} · 仅计费 {products.filter((p) => p.visibility === 'app_only').length}）·
          已配主图 {productImageMap.size} · 已发布详情页 {[...productPageStatusMap.values()].filter((s) => s === 'published').length} ·
          标签 {tagData.tags.length}（{tagData.groups.length} 组）· 分类 {categories.length}
        </p>
      </section>

      <section className="panel">
        <h2>商城首页精选（最多 {HOMEPAGE_SLOTS} 个）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          配置 orasage.com 首页与 shop 首页精选区展示的商品（仅公开商品可选）。
        </p>
        <form action={saveHomepageProductsAction} className="form-grid">
          {Array.from({ length: HOMEPAGE_SLOTS }, (_, i) => (
            <label key={i}>
              位置 {i + 1}
              <select name={`slot_${i}`} defaultValue={homepageSkus[i] ?? ''}>
                <option value="">— 不展示 —</option>
                {publicProducts.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    [{p.categoryLabel}] {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </label>
          ))}
          <AdminSubmitButton className="full-width">保存首页精选</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2>新增商品</h2>
        <ProductEditForm mode="create" tagData={tagData} categories={categories} catalog={products} />
      </section>

      <section className="panel">
        <h2>商品列表（{products.length}）</h2>
        <ProductListTable products={rows} />
      </section>
    </div>
  );
}
