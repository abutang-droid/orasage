import { getStaffUser, loginUrl } from '@/lib/auth';
import {
  getStripeCharges,
  getStripePayouts,
  getStripeReconciliation,
  getStripeRefunds,
  getStripeStatus,
} from '@/lib/api';
import { redirect } from 'next/navigation';
import { FinanceDashboard } from '@/components/FinanceDashboard';

const ALLOWED_DAYS = [7, 30, 90] as const;
const TABS = ['charges', 'refunds', 'payouts'] as const;

function resolveDays(raw?: string): number {
  const n = Number(raw ?? 30);
  return (ALLOWED_DAYS as readonly number[]).includes(n) ? n : 30;
}

function resolveTab(raw?: string): (typeof TABS)[number] {
  return (TABS as readonly string[]).includes(raw ?? '') ? (raw as (typeof TABS)[number]) : 'charges';
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams?: Promise<{ days?: string; tab?: string; sync_msg?: string }>;
}) {
  const admin = await getStaffUser(['admin']);
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};
  const days = resolveDays(sp.days);
  const tab = resolveTab(sp.tab);

  let status: Awaited<ReturnType<typeof getStripeStatus>> | null = null;
  let reconciliation: Awaited<ReturnType<typeof getStripeReconciliation>> | null = null;
  let charges: Awaited<ReturnType<typeof getStripeCharges>>['charges'] = [];
  let refunds: Awaited<ReturnType<typeof getStripeRefunds>>['refunds'] = [];
  let payouts: Awaited<ReturnType<typeof getStripePayouts>>['payouts'] = [];

  try {
    [status, reconciliation, { charges }, { refunds }, { payouts }] = await Promise.all([
      getStripeStatus(),
      getStripeReconciliation(days),
      getStripeCharges(50, 0),
      getStripeRefunds(50, 0),
      getStripePayouts(50, 0),
    ]);
  } catch (err) {
    console.error('[admin/finance]', err);
  }

  if (!status || !reconciliation) {
    return (
      <div className="admin-page">
        <header className="page-header">
          <h1>资金对账</h1>
          <p className="muted">无法加载对账数据，请确认 auth-service 已部署且包含 stripe_mirror 迁移。</p>
        </header>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>资金对账</h1>
        <p className="muted">
          平台侧 Stripe 流水镜像 + 站内订单对账 · 近 {days} 天 · 与 7c 用户钱包分开
        </p>
        <nav className="dash-period-tabs" style={{ marginTop: '0.75rem' }}>
          {ALLOWED_DAYS.map((d) => (
            <a
              key={d}
              href={`/finance?days=${d}&tab=${tab}`}
              className={`dash-period-tab${d === days ? ' is-active' : ''}`}
            >
              近 {d} 天
            </a>
          ))}
        </nav>
      </header>
      <FinanceDashboard
        configured={status.configured}
        lastSync={status.lastSync}
        balances={status.balances}
        reconciliation={reconciliation}
        charges={charges}
        refunds={refunds}
        payouts={payouts}
        days={days}
        tab={tab}
        syncMessage={sp.sync_msg ? decodeURIComponent(sp.sync_msg) : null}
      />
    </div>
  );
}
