import { getAdminUser, loginUrl } from '@/lib/auth';
import { getOrders } from '@/lib/api';
import { updateOrderStatusAction, createShipmentAction } from '@/app/actions';
import { redirect } from 'next/navigation';
import { formatShippingDisplay, SHIPMENT_STATUS_LABELS } from '../../../../shared/shop-fulfillment/index';

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
        <p className="muted">来自 shop 与各命理 App 的结账记录 · 录入运单后用户可在订单详情查看物流</p>
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
                <th>物流</th>
                <th>状态</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={11} className="muted">暂无订单</td></tr>
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
                  <td className="shipping-cell">
                    {o.shipments && o.shipments.length > 0 ? (
                      <ul className="shipment-list">
                        {o.shipments.map((s) => (
                          <li key={s.id}>
                            <strong>{s.carrier}</strong> {s.trackingNo}
                            <span className="muted"> · {SHIPMENT_STATUS_LABELS[s.status] ?? s.status}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="muted">未发货</span>
                    )}
                  </td>
                  <td><span className="badge">{o.statusLabel}</span></td>
                  <td>{new Date(o.createdAt).toLocaleString('zh-CN')}</td>
                  <td className="admin-order-actions">
                    <form action={createShipmentAction} className="shipment-form">
                      <input type="hidden" name="orderNo" value={o.orderNo} />
                      <input type="text" name="carrier" placeholder="承运商" className="shipment-input" required />
                      <input type="text" name="trackingNo" placeholder="运单号" className="shipment-input" required />
                      <button type="submit" className="btn-small">发货</button>
                    </form>
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
