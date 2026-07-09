import { getShopStaff, loginUrl } from '@/lib/auth';
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
          用户 UGC 评价审核。CMS「商品精选评价」为运营层内容，与此列表独立维护。
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
