import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminToken, getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { listCmsPages } from '@/lib/cms-content-api';
import { deletePageAction, savePageMetaAction } from '@/app/content-actions';
import { AdminSubmitButton } from '@/components/AdminButton';

const APP_SOURCES = [
  { value: '', label: '全部栏目' },
  { value: 'daozang', label: '道藏精选' },
  { value: 'famous', label: '名人案例' },
  { value: 'main', label: '主站通用' },
  { value: 'bazi', label: '八字' },
  { value: 'ziwei', label: '紫微' },
  { value: 'tarot', label: '塔罗' },
  { value: 'shop', label: '商城' },
] as const;

export default async function ContentPagesIndexPage({
  searchParams,
}: {
  searchParams?: Promise<{ app?: string; saved?: string; err?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.pages')) redirect('/');

  const sp = (await searchParams) ?? {};
  const appSource = sp.app?.trim() || '';
  const token = await getAdminToken();
  if (!token) redirect(loginUrl());

  const pages = await listCmsPages(token, {
    appSource: appSource || undefined,
    limit: 120,
  });

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>页面与文章</h1>
        <p className="muted">
          自研元数据与 HTML 正文编辑（content.pages）。前台道藏 / 名人案例等主要读 legacyHtml。
        </p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">
          {decodeURIComponent(sp.err)}
        </p>
      ) : null}

      <section className="panel">
        <form method="get" className="product-list-filters" style={{ marginBottom: '1rem' }}>
          <select name="app" defaultValue={appSource}>
            {APP_SOURCES.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary btn-secondary--sm">
            筛选
          </button>
        </form>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>slug</th>
                <th>栏目</th>
                <th>状态</th>
                <th>更新</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">暂无页面</td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>
                      <code>{p.slug}</code>
                    </td>
                    <td>{p.appSource ?? '—'}</td>
                    <td>
                      {p.wpStatus === 'draft' ? (
                        <span className="badge off">草稿</span>
                      ) : (
                        <span className="badge ok">已发布</span>
                      )}
                    </td>
                    <td className="muted">
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleString('zh-CN') : '—'}
                    </td>
                    <td>
                      <Link href={`/content/pages/${p.id}`} className="btn-text">
                        编辑
                      </Link>
                      <form
                        action={deletePageAction}
                        style={{ display: 'inline', marginLeft: 8 }}
                      >
                        <input type="hidden" name="id" value={p.id} />
                        <AdminSubmitButton size="sm" variant="ghost">
                          删除
                        </AdminSubmitButton>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>新建页面</h2>
        <form action={savePageMetaAction} className="form-grid">
          <label>
            标题
            <input name="title" required />
          </label>
          <label>
            slug
            <input name="slug" required placeholder="my-article" />
          </label>
          <label>
            发布栏目
            <select name="appSource" defaultValue="main">
              {APP_SOURCES.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            状态
            <select name="wpStatus" defaultValue="draft">
              <option value="publish">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </label>
          <label className="full-width">
            摘要
            <textarea name="excerpt" rows={2} />
          </label>
          <label className="full-width">
            HTML 正文（legacyHtml）
            <textarea name="legacyHtml" rows={8} placeholder="<p>…</p>" />
          </label>
          <AdminSubmitButton>创建</AdminSubmitButton>
        </form>
      </section>
    </div>
  );
}
