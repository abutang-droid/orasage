import { getAdminUser, loginUrl } from '@/lib/auth';
import { getReadings, type AdminReading } from '@/lib/api';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const DEFAULT_LIMIT = 50;

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false });
  } catch {
    return iso;
  }
}

export default async function AdminReadingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ app?: string; q?: string; hasReport?: string; offset?: string; limit?: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};
  const limit = Math.min(Math.max(Number(sp.limit) || DEFAULT_LIMIT, 1), 200);
  const offset = Math.max(0, Number(sp.offset) || 0);
  const app = sp.app?.trim() || undefined;
  const q = sp.q?.trim() || undefined;
  const hasReport = sp.hasReport !== '0';

  let readings: AdminReading[] = [];
  let total = 0;
  let loadError = '';
  try {
    ({ readings, total } = await getReadings({ app, q, hasReport, limit, offset }));
  } catch (err) {
    console.error('[admin/readings]', err);
    loadError = err instanceof Error ? err.message : '加载失败';
  }

  const mkHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = {
      app: app ?? '',
      q: q ?? '',
      hasReport: hasReport ? '1' : '0',
      offset: String(offset),
      limit: String(limit),
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `/readings?${qs}` : '/readings';
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>测试报告</h1>
        <p className="muted">
          用户排盘 / 测试后生成的静态报告会同步到此列表（含游客）。点击「打开报告」查看固定 HTML 页。
        </p>
      </header>

      <section className="panel" style={{ marginBottom: '1rem' }}>
        <form className="admin-filter-bar" method="get" action="/readings">
          <label>
            应用
            <select name="app" defaultValue={app ?? ''}>
              <option value="">全部</option>
              <option value="bazi">八字</option>
              <option value="ziwei">紫微</option>
              <option value="tarot">塔罗</option>
            </select>
          </label>
          <label>
            搜索
            <input name="q" type="search" placeholder="标题 / 摘要 / readingId" defaultValue={q ?? ''} />
          </label>
          <label className="admin-filter-check">
            <input type="hidden" name="hasReport" value="0" />
            <input type="checkbox" name="hasReport" value="1" defaultChecked={hasReport} />
            仅有报告链接
          </label>
          <button type="submit" className="btn-primary">筛选</button>
        </form>
      </section>

      <section className="panel">
        {loadError ? <p className="error">{loadError}</p> : null}
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          共 {total} 条 · 当前 {offset + 1}–{Math.min(offset + limit, total)}
        </p>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>用户</th>
                <th>应用</th>
                <th>标题</th>
                <th>摘要</th>
                <th>报告</th>
              </tr>
            </thead>
            <tbody>
              {readings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: '2rem' }}>
                    暂无测试报告
                  </td>
                </tr>
              ) : (
                readings.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatTime(String(r.createdAt))}</td>
                    <td>
                      <div>{r.userLabel}</div>
                      {r.userEmail ? <div className="muted" style={{ fontSize: '0.75rem' }}>{r.userEmail}</div> : null}
                    </td>
                    <td>{r.appLabel}</td>
                    <td>
                      <div>{r.title}</div>
                      <div className="muted" style={{ fontSize: '0.7rem' }}>{r.readingId}</div>
                    </td>
                    <td className="muted" style={{ maxWidth: 280, fontSize: '0.85rem' }}>
                      {r.summary || '—'}
                    </td>
                    <td>
                      {r.reportUrl ? (
                        <a href={r.reportUrl} target="_blank" rel="noopener noreferrer" className="btn-text">
                          打开报告
                        </a>
                      ) : (
                        <span className="muted">无链接</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-pager" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          {offset > 0 ? (
            <Link href={mkHref({ offset: String(Math.max(0, offset - limit)) })} className="btn-text">
              上一页
            </Link>
          ) : null}
          {offset + limit < total ? (
            <Link href={mkHref({ offset: String(offset + limit) })} className="btn-text">
              下一页
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
