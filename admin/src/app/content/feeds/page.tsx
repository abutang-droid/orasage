import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminToken, getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { listCmsFeedItems, type FeedCollectionSlug } from '@/lib/cms-content-api';
import {
  deleteFeedItemAction,
  saveFeedItemAction,
} from '@/app/content-actions';
import { AdminSubmitButton } from '@/components/AdminButton';

const TABS = [
  { app: 'bazi', label: '八字', collection: 'bazi-feed' as FeedCollectionSlug },
  { app: 'ziwei', label: '紫微', collection: 'ziwei-feed' as FeedCollectionSlug },
] as const;

export default async function ContentFeedsPage({
  searchParams,
}: {
  searchParams?: Promise<{ app?: string; saved?: string; err?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.feed')) redirect('/');

  const sp = (await searchParams) ?? {};
  const app = sp.app === 'ziwei' ? 'ziwei' : 'bazi';
  const tab = TABS.find((t) => t.app === app) ?? TABS[0];
  const token = await getAdminToken();
  if (!token) redirect(loginUrl());

  const items = await listCmsFeedItems(tab.collection, token);

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>信息流</h1>
        <p className="muted">
          八字 / 紫微首页滚动条（content.feed）。订单动态与用户评价交替展示。
        </p>
      </header>

      <nav className="product-content-locale-tabs" aria-label="应用">
        {TABS.map((t) => (
          <Link
            key={t.app}
            href={`/content/feeds?app=${t.app}`}
            className={`product-edit-tab${t.app === app ? ' is-active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">
          {decodeURIComponent(sp.err)}
        </p>
      ) : null}

      <section className="panel">
        <h2>{tab.label} · {items.length} 条</h2>
        <div className="table-wrap" style={{ marginBottom: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>文案</th>
                <th>语言</th>
                <th>排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">暂无条目</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.kind === 'review' ? '用户评价' : '订单动态'}</td>
                    <td>{item.message}</td>
                    <td>{item.locale ?? 'zh-CN'}</td>
                    <td>{item.sort ?? 0}</td>
                    <td>
                      {item.enabled !== false ? (
                        <span className="badge ok">启用</span>
                      ) : (
                        <span className="badge off">停用</span>
                      )}
                    </td>
                    <td>
                      <details>
                        <summary>编辑</summary>
                        <form action={saveFeedItemAction} className="inline-form">
                          <input type="hidden" name="app" value={app} />
                          <input type="hidden" name="id" value={item.id} />
                          <select name="kind" defaultValue={item.kind}>
                            <option value="order">订单动态</option>
                            <option value="review">用户评价</option>
                          </select>
                          <input name="message" defaultValue={item.message} required />
                          <select name="locale" defaultValue={item.locale ?? 'zh-CN'}>
                            <option value="zh-CN">简体</option>
                            <option value="zh-TW">繁体</option>
                            <option value="en">English</option>
                            <option value="pt-BR">Português</option>
                          </select>
                          <input name="sort" type="number" defaultValue={item.sort ?? 0} />
                          <label className="checkbox-label">
                            <input
                              name="enabled"
                              type="checkbox"
                              defaultChecked={item.enabled !== false}
                            />
                            启用
                          </label>
                          <AdminSubmitButton size="sm">保存</AdminSubmitButton>
                        </form>
                        <form action={deleteFeedItemAction} style={{ marginTop: '0.35rem' }}>
                          <input type="hidden" name="app" value={app} />
                          <input type="hidden" name="id" value={item.id} />
                          <AdminSubmitButton size="sm" variant="ghost">
                            删除
                          </AdminSubmitButton>
                        </form>
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <details open={items.length === 0}>
          <summary>＋ 新增条目</summary>
          <form action={saveFeedItemAction} className="form-grid" style={{ marginTop: '0.75rem' }}>
            <input type="hidden" name="app" value={app} />
            <label>
              类型
              <select name="kind" defaultValue="order">
                <option value="order">订单动态</option>
                <option value="review">用户评价</option>
              </select>
            </label>
            <label>
              语言
              <select name="locale" defaultValue="zh-CN">
                <option value="zh-CN">简体</option>
                <option value="zh-TW">繁体</option>
                <option value="en">English</option>
                <option value="pt-BR">Português</option>
              </select>
            </label>
            <label>
              排序
              <input name="sort" type="number" defaultValue={0} />
            </label>
            <label className="checkbox-label">
              <input name="enabled" type="checkbox" defaultChecked /> 启用
            </label>
            <label className="full-width">
              展示文案
              <input name="message" required placeholder="张** 刚刚完成了排盘" />
            </label>
            <AdminSubmitButton>添加</AdminSubmitButton>
          </form>
        </details>
      </section>
    </div>
  );
}
