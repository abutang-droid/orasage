import { getAdminUser, loginUrl } from '@/lib/auth';
import { getAnalyticsEvents, getDashboard } from '@/lib/api';
import { redirect } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

const ALLOWED_DAYS = [7, 14, 30] as const;

function resolveDays(raw?: string): number {
  const n = Number(raw ?? 7);
  return (ALLOWED_DAYS as readonly number[]).includes(n) ? n : 7;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ days?: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};
  const days = resolveDays(sp.days);

  let dashboard: Awaited<ReturnType<typeof getDashboard>> | null = null;
  let recentEvents: Awaited<ReturnType<typeof getAnalyticsEvents>>['events'] = [];

  try {
    [dashboard, { events: recentEvents }] = await Promise.all([
      getDashboard(days),
      getAnalyticsEvents({ limit: 30 }),
    ]);
  } catch (err) {
    console.error('[admin/analytics]', err);
  }

  if (!dashboard) {
    return (
      <div className="admin-page">
        <header className="page-header">
          <h1>数据统计</h1>
          <p className="muted">无法加载统计数据，请确认 auth-service 已部署且包含 analytics 迁移。</p>
        </header>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>数据统计</h1>
        <p className="muted">
          运营看板：用户、订单、测算与埋点趋势 · 统计自 {new Date(dashboard.since).toLocaleDateString('zh-CN')} 起
        </p>
      </header>
      <AnalyticsDashboard dashboard={dashboard} recentEvents={recentEvents} days={days} />
    </div>
  );
}
