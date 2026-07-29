import Link from 'next/link';
import { getShopStaff, loginUrl, staffCan } from '@/lib/auth';
import { getProductReviews } from '@/lib/api';
import { redirect } from 'next/navigation';
import { ProductReviewsTable } from '@/components/ProductReviewsTable';

export default async function ShopReviewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; sku?: string }>;
}) {
  const staff = await getShopStaff();
  if (!staff) redirect(loginUrl());
  if (!staffCan(staff, 'shop.reviews')) redirect('/');

  const sp = (await searchParams) ?? {};
  let reviews: Awaited<ReturnType<typeof getProductReviews>>['reviews'] = [];
  try {
    ({ reviews } = await getProductReviews({
      status: sp.status,
      sku: sp.sku,
    }));
  } catch (err) {
    console.error('[admin/shop/reviews]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>评价管理</h1>
        <p className="muted">
          买家 UGC 审核（shop.reviews）。运营精选评价在{' '}
          <Link href="/content/products">商品内容</Link>
          （content.product）维护，两套入口、权限与数据源均独立。
        </p>
      </header>

      <section className="panel">
        <form method="get" className="product-list-filters">
          <input type="search" name="sku" placeholder="SKU" defaultValue={sp.sku ?? ''} />
          <select name="status" defaultValue={sp.status ?? ''}>
            <option value="">全部状态</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
            <option value="featured">featured</option>
          </select>
          <button type="submit" className="btn-secondary btn-secondary--sm">筛选</button>
        </form>
        <ProductReviewsTable reviews={reviews} />
      </section>
    </div>
  );
}
