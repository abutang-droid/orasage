import { getAdminUser, loginUrl } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { listAdminChangelogEntries } from '@/lib/admin-backend/changelog';

export default async function AdminChangelogPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const entries = listAdminChangelogEntries();

  return (
    <div className="admin-page admin-changelog-page">
      <header className="page-header">
        <h1>更新日志</h1>
        <p className="muted">
          后台与配置规范相关的交付记录。全局规则增减见各条「规则影响」。数据源：
          <code>shared/admin-backend/changelog.json</code>
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="muted">暂无记录。</p>
      ) : (
        <ol className="admin-changelog-list">
          {entries.map((entry) => {
            const impact = entry.rulesImpact ?? { added: [], changed: [], removed: [] };
            const hasImpact =
              impact.added.length > 0 || impact.changed.length > 0 || impact.removed.length > 0;
            return (
              <li key={entry.id} className="admin-changelog-item">
                <div className="admin-changelog-item-head">
                  <time dateTime={entry.date}>{entry.date}</time>
                  {entry.phase ? <span className="admin-changelog-phase">Phase {entry.phase}</span> : null}
                  {entry.modules?.length ? (
                    <span className="admin-changelog-modules">{entry.modules.join(' · ')}</span>
                  ) : null}
                </div>
                <h2 className="admin-changelog-title">{entry.title}</h2>
                <p className="admin-changelog-summary">{entry.summary}</p>

                {hasImpact ? (
                  <div className="admin-changelog-rules">
                    <h3>规则影响</h3>
                    {impact.added.length > 0 ? (
                      <div>
                        <strong>新增</strong>
                        <ul>
                          {impact.added.map((line) => (
                            <li key={`a-${line}`}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {impact.changed.length > 0 ? (
                      <div>
                        <strong>修改</strong>
                        <ul>
                          {impact.changed.map((line) => (
                            <li key={`c-${line}`}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {impact.removed.length > 0 ? (
                      <div>
                        <strong>删除</strong>
                        <ul>
                          {impact.removed.map((line) => (
                            <li key={`r-${line}`}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="muted admin-changelog-no-rules">无全局规则变更</p>
                )}

                {entry.links?.length ? (
                  <ul className="admin-changelog-links">
                    {entry.links.map((href) => (
                      <li key={href}>
                        <code>{href}</code>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
