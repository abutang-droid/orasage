import { getAdminUser, loginUrl } from '@/lib/auth';
import { getOrders } from '@/lib/api';
import { redirect } from 'next/navigation';
import { MarkOrdersSeen } from '@/components/OrdersNavBadge';
import { OrderListTable } from '@/components/OrderListTable';

const DEFAULT_LIMIT = 50;

export default async function ShopOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; app?: string; q?: string; offset?: string; limit?: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};
  const limit = Math.min(Math.max(Number(sp.limit) || DEFAULT_LIMIT, 1), 200);
  const offset = Math.max(0, Number(sp.offset) || 0);
  const filters = {
    status: sp.status?.trim() || undefined,
    app: sp.app?.trim() || undefined,
    q: sp.q?.trim() || undefined,
  };

  let orders: Awaited<ReturnType<typeof getOrders>>['orders'] = [];
  let total = 0;
  try {
    ({ orders, total } = await getOrders({ ...filters, limit, offset }));
  } catch (err) {
    console.error('[admin/shop/orders]', err);
  }

  return (
    <div className="admin-page">
      <MarkOrdersSeen />
      <header className="page-header">
        <h1>订单管理</h1>
        <p className="muted">来自 shop 与各命理 App 的结账记录 · 支持筛选、分页、批量发货与 CSV 导出</p>
      </header>

      <section className="panel">
        <OrderListTable
          orders={orders}
          total={total}
          limit={limit}
          offset={offset}
          filters={filters}
        />
      </section>
    </div>
  );
}
