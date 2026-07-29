import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminToken, getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import {
  getCmsHeroGlobal,
  HERO_APP_LABELS,
  HERO_APP_SLUGS,
  isHeroAppId,
  type HeroAppId,
} from '@/lib/cms-content-api';

const APPS = Object.keys(HERO_APP_SLUGS) as HeroAppId[];

export default async function ContentHeroesPage({
  searchParams,
}: {
  searchParams?: Promise<{ app?: string; err?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.heroes')) redirect('/');

  const sp = (await searchParams) ?? {};
  if (isHeroAppId(sp.app)) {
    redirect(`/content/heroes/${sp.app}`);
  }

  const token = await getAdminToken();
  const summaries = await Promise.all(
    APPS.map(async (app) => {
      let enabled: boolean | null = null;
      let displayMode: string | null = null;
      let headline: string | null = null;
      if (token) {
        try {
          const doc = await getCmsHeroGlobal(app, token);
          enabled = doc?.enabled ?? null;
          displayMode = doc?.displayMode ?? null;
          headline = doc?.headline ?? null;
        } catch (err) {
          console.error(`[admin/content/heroes ${app}]`, err);
        }
      }
      return { app, enabled, displayMode, headline };
    }),
  );

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>各站 Hero</h1>
        <p className="muted">
          自研编辑各站首页 Hero（content.heroes）。写入 CMS globals，前台约 30 秒内生效。
        </p>
      </header>

      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">
          {decodeURIComponent(sp.err)}
        </p>
      ) : null}

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>站点</th>
                <th>状态</th>
                <th>模式</th>
                <th>主标题</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {summaries.map((row) => (
                <tr key={row.app}>
                  <td>{HERO_APP_LABELS[row.app]}</td>
                  <td>
                    {row.enabled === false ? (
                      <span className="badge off">停用</span>
                    ) : row.enabled == null ? (
                      <span className="muted">—</span>
                    ) : (
                      <span className="badge ok">启用</span>
                    )}
                  </td>
                  <td>{row.displayMode ?? '—'}</td>
                  <td className="muted">{row.headline || '（无）'}</td>
                  <td>
                    <Link href={`/content/heroes/${row.app}`} className="btn-text">
                      编辑
                    </Link>
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
