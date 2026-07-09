import Link from 'next/link';
import type { AdminAnalyticsEvent, AdminDashboard } from '@/lib/api';
import { DailyBarChart } from '@/components/DailyBarChart';
import {
  appLabel,
  formatDateTime,
  formatDayLabel,
  formatRevenue,
  orderStatusLabel,
} from '@/lib/dashboard-labels';

const PERIOD_OPTIONS = [7, 14, 30] as const;

type Props = {
  dashboard: AdminDashboard;
  recentEvents: AdminAnalyticsEvent[];
  days: number;
};

export function AnalyticsDashboard({ dashboard, recentEvents, days }: Props) {
  const { operations, analytics } = dashboard;

  return (
    <div className="analytics-dashboard">
      <div className="dash-period-tabs">
        {PERIOD_OPTIONS.map((d) => (
          <Link
            key={d}
            href={`/analytics?days=${d}`}
            className={`dash-period-tab${d === days ? ' is-active' : ''}`}
          >
            近 {d} 天
          </Link>
        ))}
      </div>

      <section className="card-grid dash-kpi-grid">
        <div className="card">
          <h2>新增用户</h2>
          <div className="value">{operations.period.newUsers}</div>
          <p className="muted">累计 {operations.totals.users.toLocaleString('zh-CN')}</p>
        </div>
        <div className="card">
          <h2>新增订单</h2>
          <div className="value">{operations.period.newOrders}</div>
          <p className="muted">已支付 {operations.period.paidOrders}</p>
        </div>
        <div className="card">
          <h2>成交额</h2>
          <div className="value dash-value-sm">{formatRevenue(operations.period.revenueCents)}</div>
          <p className="muted">已支付订单金额合计</p>
        </div>
        <div className="card">
          <h2>新增测算</h2>
          <div className="value">{operations.period.newReadings}</div>
          <p className="muted">累计 {operations.totals.readings.toLocaleString('zh-CN')}</p>
        </div>
        <div className="card">
          <h2>埋点事件</h2>
          <div className="value">{analytics.total.toLocaleString('zh-CN')}</div>
          <p className="muted">近 {days} 天上报量</p>
        </div>
      </section>

      <div className="dash-charts-row">
        <section className="panel dash-chart-panel">
          <DailyBarChart
            title="每日订单"
            points={operations.dailyOrders.map((d) => ({
              label: formatDayLabel(d.day),
              count: d.count,
            }))}
          />
        </section>
        <section className="panel dash-chart-panel">
          <DailyBarChart
            title="每日埋点"
            points={analytics.daily.map((d) => ({
              label: formatDayLabel(d.day),
              count: d.count,
            }))}
            emptyLabel="暂无埋点数据（需各 App 接入 @orasage/analytics）"
          />
        </section>
      </div>

      <div className="dash-tables-row">
        <section className="panel">
          <h2>订单按状态</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>状态</th>
                <th>数量</th>
              </tr>
            </thead>
            <tbody>
              {operations.ordersByStatus.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">暂无订单</td>
                </tr>
              ) : (
                operations.ordersByStatus.map((r) => (
                  <tr key={r.status}>
                    <td>{orderStatusLabel(r.status)}</td>
                    <td>{r.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>订单按来源</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>应用</th>
                <th>订单数</th>
              </tr>
            </thead>
            <tbody>
              {operations.ordersByApp.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">暂无订单</td>
                </tr>
              ) : (
                operations.ordersByApp.map((r) => (
                  <tr key={r.app}>
                    <td>{appLabel(r.app)}</td>
                    <td>{r.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      <div className="dash-tables-row">
        <section className="panel">
          <h2>埋点按应用</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>应用</th>
                <th>事件数</th>
              </tr>
            </thead>
            <tbody>
              {analytics.byApp.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">暂无埋点</td>
                </tr>
              ) : (
                analytics.byApp.map((r) => (
                  <tr key={r.app}>
                    <td>{appLabel(r.app)}</td>
                    <td>{r.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>热门事件 Top 15</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>应用</th>
                <th>事件</th>
                <th>次数</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="muted">暂无埋点</td>
                </tr>
              ) : (
                analytics.topEvents.slice(0, 15).map((r) => (
                  <tr key={`${r.app}:${r.eventName}`}>
                    <td>{appLabel(r.app)}</td>
                    <td><code>{r.eventName}</code></td>
                    <td>{r.count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      <section className="panel">
        <h2>最近埋点事件</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>应用</th>
                <th>事件</th>
                <th>路径</th>
                <th>用户</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">暂无最近事件</td>
                </tr>
              ) : (
                recentEvents.map((e) => (
                  <tr key={e.id}>
                    <td>{formatDateTime(e.createdAt)}</td>
                    <td>{appLabel(e.app)}</td>
                    <td><code>{e.eventName}</code></td>
                    <td className="dash-path-cell">{e.path ?? '—'}</td>
                    <td>{e.userId ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
