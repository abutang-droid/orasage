import { getAdminUser, loginUrl } from '@/lib/auth';
import { getOrders } from '@/lib/api';
import { updateOrderStatusAction } from '@/app/actions';
import { redirect } from 'next/navigation';
import { formatShippingDisplay } from '../../../../shared/shop-fulfillment/index';

const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'] as const;

export default async function OrdersPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  let orders: Awaited<ReturnType<typeof getOrders>>['orders'] = [];
  try {
    ({ orders } = await getOrders());
  } catch (err) {
    console.error('[admin/orders]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>订单管理</h1>
        <p className="muted">来自 shop 与各命理 App 的结账记录</p>
      </header>

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>用户 ID</th>
                <th>标题</th>
                <th>SKU</th>
                <th>金额</th>
                <th>来源</th>
                <th>收货信息</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={10} className="muted">暂无订单</td></tr>
              ) : orders.map((o) => (
                <tr key={o.orderNo}>
                  <td><code>{o.orderNo}</code></td>
                  <td>{o.userId}</td>
                  <td>{o.title}</td>
                  <td>{o.sku ? <code>{o.sku}</code> : '—'}</td>
                  <td>{o.amountDisplay}</td>
                  <td>{o.appLabel ?? '—'}</td>
                  <td className="shipping-cell">
                    {o.shippingAddress
                      ? formatShippingDisplay(o.shippingAddress)
                      : '—'}
                  </td>
                  <td><span className="badge">{o.statusLabel}</span></td>
                  <td>{new Date(o.createdAt).toLocaleString('zh-CN')}</td>
                  <td>
                    <form action={updateOrderStatusAction} className="inline-status-form">
                      <input type="hidden" name="orderNo" value={o.orderNo} />
                      <select name="status" defaultValue={o.status}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button type="submit" className="btn-small">更新</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
