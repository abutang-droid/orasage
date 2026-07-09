'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminOrder } from '@/lib/api';
import { batchCreateOrderShipmentsAction } from '@/app/actions';
import { updateOrderStatusAction, createShipmentAction } from '@/app/actions';
import { AdminSubmitButton } from './AdminButton';
import { formatShippingDisplay, SHIPMENT_STATUS_LABELS } from '../../../shared/shop-fulfillment/index';
import { parseDiyOrderContext, formatDiySequence } from '../../../shared/shop-diy/order-context';

const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled'] as const;
const APPS = ['shop', 'bazi', 'ziwei', 'tarot'] as const;

type OrderListTableProps = {
  orders: AdminOrder[];
  total: number;
  limit: number;
  offset: number;
  filters: { status?: string; app?: string; q?: string };
};

function escapeCsv(value: string | number | null | undefined): string {
  const text = value == null ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadOrdersCsv(orders: AdminOrder[]) {
  const header = ['orderNo', 'userId', 'title', 'sku', 'amount', 'status', 'app', 'createdAt'];
  const lines = orders.map((o) => [
    o.orderNo,
    o.userId,
    o.title,
    o.sku ?? '',
    o.amountDisplay,
    o.status,
    o.appSource ?? '',
    o.createdAt,
  ].map(escapeCsv).join(','));
  const blob = new Blob(['\ufeff' + [header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function filterQuery(filters: OrderListTableProps['filters'], offset: number, limit: number) {
  const sp = new URLSearchParams();
  if (filters.status) sp.set('status', filters.status);
  if (filters.app) sp.set('app', filters.app);
  if (filters.q) sp.set('q', filters.q);
  sp.set('offset', String(offset));
  sp.set('limit', String(limit));
  return sp.toString();
}

export function OrderListTable({ orders, total, limit, offset, filters }: OrderListTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchCarrier, setBatchCarrier] = useState('');
  const [batchTrackings, setBatchTrackings] = useState<Record<string, string>>({});
  const [batchPending, setBatchPending] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const selectedList = useMemo(() => [...selected].filter((no) => orders.some((o) => o.orderNo === no)), [selected, orders]);
  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.orderNo));
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) orders.forEach((o) => next.delete(o.orderNo));
      else orders.forEach((o) => next.add(o.orderNo));
      return next;
    });
  };

  const onBatchShip = async () => {
    if (!batchCarrier.trim() || selectedList.length === 0) {
      setBatchError('请填写承运商并勾选订单');
      return;
    }
    const items = selectedList.map((orderNo) => ({
      orderNo,
      carrier: batchCarrier.trim(),
      trackingNo: (batchTrackings[orderNo] ?? '').trim(),
    }));
    if (items.some((i) => !i.trackingNo)) {
      setBatchError('请为每个选中订单填写运单号');
      return;
    }
    setBatchPending(true);
    setBatchError(null);
    try {
      await batchCreateOrderShipmentsAction(items);
      setSelected(new Set());
      setBatchTrackings({});
      router.refresh();
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : '批量发货失败');
    } finally {
      setBatchPending(false);
    }
  };

  return (
    <>
      <form method="get" className="product-list-filters order-list-filters">
        <input type="hidden" name="offset" value="0" />
        <input type="hidden" name="limit" value={String(limit)} />
        <input
          type="search"
          name="q"
          placeholder="搜索订单号 / SKU / 标题"
          defaultValue={filters.q ?? ''}
        />
        <select name="status" defaultValue={filters.status ?? ''}>
          <option value="">全部状态</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="app" defaultValue={filters.app ?? ''}>
          <option value="">全部来源</option>
          {APPS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <button type="submit" className="btn-secondary btn-secondary--sm">筛选</button>
        <span className="muted">{total} 条 · 第 {currentPage}/{pageCount} 页</span>
      </form>

      <div className="product-list-toolbar">
        <button type="button" className="btn-secondary btn-secondary--sm" onClick={() => downloadOrdersCsv(orders)}>
          导出当前页 CSV ({orders.length})
        </button>
        {offset > 0 ? (
          <Link className="btn-secondary btn-secondary--sm" href={`/shop/orders?${filterQuery(filters, Math.max(0, offset - limit), limit)}`}>
            上一页
          </Link>
        ) : null}
        {offset + limit < total ? (
          <Link className="btn-secondary btn-secondary--sm" href={`/shop/orders?${filterQuery(filters, offset + limit, limit)}`}>
            下一页
          </Link>
        ) : null}
      </div>

      {selectedList.length > 0 ? (
        <div className="order-batch-panel panel">
          <h3>批量发货（{selectedList.length} 单）</h3>
          <label>
            承运商（共用）
            <input value={batchCarrier} onChange={(e) => setBatchCarrier(e.target.value)} placeholder="顺丰 / 中通" />
          </label>
          <div className="order-batch-rows">
            {selectedList.map((orderNo) => (
              <label key={orderNo}>
                <code>{orderNo}</code>
                <input
                  value={batchTrackings[orderNo] ?? ''}
                  onChange={(e) => setBatchTrackings((prev) => ({ ...prev, [orderNo]: e.target.value }))}
                  placeholder="运单号"
                />
              </label>
            ))}
          </div>
          {batchError ? <p className="panel-notice panel-notice--error">{batchError}</p> : null}
          <button type="button" className="btn-primary" disabled={batchPending} onClick={() => void onBatchShip()}>
            {batchPending ? '提交中…' : '确认批量发货'}
          </button>
        </div>
      ) : null}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="product-list-check-col">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="全选本页" />
              </th>
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
              <tr><td colSpan={12} className="muted">暂无订单</td></tr>
            ) : orders.map((o) => {
              const diy = parseDiyOrderContext(o.recommendationContext);
              return (
                <tr key={o.orderNo}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(o.orderNo)}
                      onChange={() => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(o.orderNo)) next.delete(o.orderNo);
                          else next.add(o.orderNo);
                          return next;
                        });
                      }}
                      aria-label={`选择 ${o.orderNo}`}
                    />
                  </td>
                  <td><code>{o.orderNo}</code></td>
                  <td>{o.userId}</td>
                  <td>
                    {o.title}
                    {diy ? (
                      <details className="diy-config-details">
                        <summary>定制配置（手围 {diy.wristCm}cm · 串长 {(diy.lengthMm / 10).toFixed(1)}cm）</summary>
                        <div className="diy-config-body">
                          <p className="muted" style={{ margin: '0.35rem 0' }}>
                            用料：{diy.items.map((item) => `${item.name} ${item.sizeLabel} ×${item.quantity}`).join('、')}
                          </p>
                          <ol className="diy-sequence">
                            {formatDiySequence(diy).map((line) => (
                              <li key={line}>{line.replace(/^\d+\.\s*/, '')}</li>
                            ))}
                          </ol>
                        </div>
                      </details>
                    ) : null}
                  </td>
                  <td>{o.sku ? <code>{o.sku}</code> : '—'}</td>
                  <td>{o.amountDisplay}</td>
                  <td>{o.appLabel ?? '—'}</td>
                  <td className="shipping-cell">
                    {o.shippingAddress ? formatShippingDisplay(o.shippingAddress) : '—'}
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
                      <AdminSubmitButton size="sm">发货</AdminSubmitButton>
                    </form>
                    <form action={updateOrderStatusAction} className="inline-status-form">
                      <input type="hidden" name="orderNo" value={o.orderNo} />
                      <select name="status" defaultValue={o.status}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <AdminSubmitButton size="sm">更新</AdminSubmitButton>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
