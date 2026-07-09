import { getShopStaff, loginUrl } from '@/lib/auth';
import { getCoupons } from '@/lib/api';
import { redirect } from 'next/navigation';
import { CouponsEditor } from '@/components/CouponsEditor';

export default async function ShopPromotionsPage() {
  const staff = await getShopStaff();
  if (!staff) redirect(loginUrl());

  let coupons: Awaited<ReturnType<typeof getCoupons>>['coupons'] = [];
  try {
    ({ coupons } = await getCoupons());
  } catch (err) {
    console.error('[admin/shop/promotions]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>促销管理</h1>
        <p className="muted">
          配置优惠码；商品限时价可在商品编辑页「促销价」区设置（salePrice + 起止时间）。
        </p>
      </header>

      <section className="panel">
        <CouponsEditor coupons={coupons} />
      </section>
    </div>
  );
}
