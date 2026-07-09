import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminUser, loginUrl } from '@/lib/auth';
import { getProducts } from '@/lib/api';
import { fetchAdminProductImageMap } from '@/lib/cms-product-images';
import { fetchCmsProductPageStatusMap } from '@/lib/cms-product-pages';
import { ProductEditForm } from '@/components/ProductEditForm';

type PageProps = {
  params: Promise<{ sku: string }>;
  searchParams?: Promise<{ image_err?: string }>;
};

export default async function ProductEditPage({ params, searchParams }: PageProps) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const { sku: rawSku } = await params;
  const sku = decodeURIComponent(rawSku);
  const sp = (await searchParams) ?? {};

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  let productImageMap = new Map<string, string>();
  let productPageStatusMap = new Map<string, 'published' | 'draft' | 'none'>();

  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/products/edit]', err);
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

  return (
    <div className="admin-page">
      <header className="page-header">
        <p className="muted">
          <Link href="/products">← 返回商品列表</Link>
        </p>
        <h1>编辑商品 · {product.name}</h1>
        <p className="muted">
          SKU <code>{product.sku}</code> · 结构化属性存 auth-service，详情长内容与多图在 CMS。
        </p>
      </header>

      {sp.image_err ? (
        <p className="muted panel-notice panel-notice--error">
          商品信息已保存，但主图上传失败：{decodeURIComponent(sp.image_err)}
        </p>
      ) : null}

      <section className="panel">
        <ProductEditForm
          mode="edit"
          product={product}
          imageUrl={productImageMap.get(product.sku)}
          pageStatus={productPageStatusMap.get(product.sku) ?? 'none'}
        />
      </section>
    </div>
  );
}
