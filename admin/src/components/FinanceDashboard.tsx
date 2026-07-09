import Link from 'next/link';
import type {
  StripeBalanceSnapshot,
  StripeChargeRow,
  StripePayoutRow,
  StripeReconciliation,
  StripeRefundRow,
  StripeSyncRun,
} from '@/lib/api';
import { formatDateTime, formatMoney, syncStatusLabel } from '@/lib/finance-labels';
import { StripeSyncButton } from '@/components/StripeSyncButton';

const TABS = [
  { key: 'charges', label: '收款' },
  { key: 'refunds', label: '退款' },
  { key: 'payouts', label: '提现' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

type Props = {
  configured: boolean;
  lastSync: StripeSyncRun | null;
  balances: StripeBalanceSnapshot[];
  reconciliation: StripeReconciliation;
  charges: StripeChargeRow[];
  refunds: StripeRefundRow[];
  payouts: StripePayoutRow[];
  days: number;
  tab: TabKey;
  syncMessage?: string | null;
};

export function FinanceDashboard({
  configured,
  lastSync,
  balances,
  reconciliation,
  charges,
  refunds,
  payouts,
  days,
  tab,
  syncMessage,
}: Props) {
  return (
    <div className="finance-dashboard">
      <section className="panel finance-status-panel">
        <div className="finance-status-row">
          <div>
            <h2>Stripe 连接</h2>
            <p className="muted">
              {configured
                ? 'auth-service 已配置 STRIPE_SECRET_KEY，可手动同步流水。'
                : '未配置 STRIPE_SECRET_KEY：仅显示站内订单对账（mock 支付模式）。'}
            </p>
            {lastSync ? (
              <p className="muted">
                上次同步：{formatDateTime(lastSync.startedAt)} · {syncStatusLabel(lastSync.status)}
                {lastSync.finishedAt ? ` · 完成于 ${formatDateTime(lastSync.finishedAt)}` : ''}
              </p>
            ) : (
              <p className="muted">尚未执行 Stripe 同步。</p>
            )}
            {syncMessage ? <p className="finance-sync-msg">{syncMessage}</p> : null}
          </div>
          {configured ? <StripeSyncButton days={90} /> : null}
        </div>
      </section>

      {balances.length > 0 ? (
        <section className="card-grid">
          {balances.map((b) => (
            <div key={`${b.currency}-${b.id}`} className="card">
              <h2>Stripe 余额 · {b.currency.toUpperCase()}</h2>
              <div className="value dash-value-sm">{formatMoney(b.availableCents, b.currency)}</div>
              <p className="muted">待结算 {formatMoney(b.pendingCents, b.currency)}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="card-grid dash-kpi-grid">
        <div className="card">
          <h2>站内已支付订单</h2>
          <div className="value dash-value-sm">{formatMoney(reconciliation.orders.totalCents)}</div>
          <p className="muted">{reconciliation.orders.count} 笔 · 近 {days} 天</p>
        </div>
        <div className="card">
          <h2>Stripe 收款净额</h2>
          <div className="value dash-value-sm">{formatMoney(reconciliation.charges.netCents)}</div>
          <p className="muted">{reconciliation.charges.count} 笔收款</p>
        </div>
        <div className="card">
          <h2>差额（订单 − Stripe）</h2>
          <div className="value dash-value-sm">{formatMoney(reconciliation.deltaCents)}</div>
          <p className="muted">
            {reconciliation.paymentMode === 'mock'
              ? '当前为 mock 支付，差额多为正常'
              : '应接近 0；偏差请查下方明细'}
          </p>
        </div>
        <div className="card">
          <h2>退款 / 提现</h2>
          <div className="value dash-value-sm">
            {formatMoney(reconciliation.refunds.totalCents)} / {formatMoney(reconciliation.payouts.totalCents)}
          </div>
          <p className="muted">
            {reconciliation.refunds.count} 笔退款 · {reconciliation.payouts.count} 笔提现
          </p>
        </div>
      </section>

      <div className="dash-tables-row">
        <section className="panel">
          <h2>已支付订单无 Stripe 记录</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {reconciliation.ordersMissingStripe.length === 0 ? (
                <tr><td colSpan={3} className="muted">无（或尚未同步 Stripe）</td></tr>
              ) : (
                reconciliation.ordersMissingStripe.map((o) => (
                  <tr key={o.orderNo}>
                    <td><code>{o.orderNo}</code></td>
                    <td>{formatMoney(o.amountCents)}</td>
                    <td>{o.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>Stripe 收款无匹配订单</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Charge ID</th>
                <th>订单号</th>
                <th>净额</th>
              </tr>
            </thead>
            <tbody>
              {reconciliation.chargesMissingOrder.length === 0 ? (
                <tr><td colSpan={3} className="muted">无</td></tr>
              ) : (
                reconciliation.chargesMissingOrder.map((c) => (
                  <tr key={c.stripeId}>
                    <td><code>{c.stripeId}</code></td>
                    <td>{c.orderNo ?? '—'}</td>
                    <td>{formatMoney(c.amountCents - c.amountRefundedCents)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      <section className="panel">
        <div className="dash-period-tabs" style={{ marginBottom: '1rem' }}>
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/finance?days=${days}&tab=${t.key}`}
              className={`dash-period-tab${tab === t.key ? ' is-active' : ''}`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="table-scroll">
          {tab === 'charges' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>订单号</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>Stripe ID</th>
                </tr>
              </thead>
              <tbody>
                {charges.length === 0 ? (
                  <tr><td colSpan={5} className="muted">暂无数据</td></tr>
                ) : (
                  charges.map((c) => (
                    <tr key={c.stripeId}>
                      <td>{formatDateTime(c.stripeCreatedAt)}</td>
                      <td>{c.orderNo ? <code>{c.orderNo}</code> : '—'}</td>
                      <td>{formatMoney(c.amountCents - c.amountRefundedCents, c.currency)}</td>
                      <td>{c.status}</td>
                      <td><code>{c.stripeId}</code></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}

          {tab === 'refunds' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>订单号</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>Stripe ID</th>
                </tr>
              </thead>
              <tbody>
                {refunds.length === 0 ? (
                  <tr><td colSpan={5} className="muted">暂无数据</td></tr>
                ) : (
                  refunds.map((r) => (
                    <tr key={r.stripeId}>
                      <td>{formatDateTime(r.stripeCreatedAt)}</td>
                      <td>{r.orderNo ? <code>{r.orderNo}</code> : '—'}</td>
                      <td>{formatMoney(r.amountCents, r.currency)}</td>
                      <td>{r.status}</td>
                      <td><code>{r.stripeId}</code></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}

          {tab === 'payouts' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>到账日</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>Stripe ID</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr><td colSpan={5} className="muted">暂无数据</td></tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.stripeId}>
                      <td>{formatDateTime(p.stripeCreatedAt)}</td>
                      <td>{p.arrivalDate ?? '—'}</td>
                      <td>{formatMoney(p.amountCents, p.currency)}</td>
                      <td>{p.status}</td>
                      <td><code>{p.stripeId}</code></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : null}
        </div>
      </section>
    </div>
  );
}
