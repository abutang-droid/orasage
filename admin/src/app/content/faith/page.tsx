import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminToken, getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { listCmsFaiths } from '@/lib/cms-content-api';
import { deleteFaithAction, saveFaithAction } from '@/app/content-actions';
import { AdminSubmitButton } from '@/components/AdminButton';

export default async function ContentFaithPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; err?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.faith')) redirect('/');

  const sp = (await searchParams) ?? {};
  const token = await getAdminToken();
  if (!token) redirect(loginUrl());

  const faiths = await listCmsFaiths(token);

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>信仰与圣地</h1>
        <p className="muted">
          宗教 taxonomy（content.faith）。圣地 / 地理仍可在超管「内部 CMS」维护；本页编辑信仰分类。
        </p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">
          {decodeURIComponent(sp.err)}
        </p>
      ) : null}

      <section className="panel">
        <h2>信仰列表 · {faiths.length}</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>代码</th>
                <th>中文</th>
                <th>英文</th>
                <th>排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {faiths.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">暂无数据</td>
                </tr>
              ) : (
                faiths.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <code>{f.code}</code>
                    </td>
                    <td>
                      {f.emoji ? `${f.emoji} ` : ''}
                      {f.nameZh}
                    </td>
                    <td>{f.nameEn}</td>
                    <td>{f.rank ?? 50}</td>
                    <td>
                      {f.wpStatus === 'draft' ? (
                        <span className="badge off">草稿</span>
                      ) : (
                        <span className="badge ok">已发布</span>
                      )}
                    </td>
                    <td>
                      <Link href={`/content/faith/${f.id}`} className="btn-text">
                        编辑
                      </Link>
                      <form action={deleteFaithAction} style={{ display: 'inline', marginLeft: 8 }}>
                        <input type="hidden" name="id" value={f.id} />
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
        <h2>新增信仰</h2>
        <form action={saveFaithAction} className="form-grid">
          <label>
            代码 ID
            <input name="code" required placeholder="taoism" />
          </label>
          <label>
            中文名
            <input name="nameZh" required />
          </label>
          <label>
            英文名
            <input name="nameEn" required />
          </label>
          <label>
            表情
            <input name="emoji" placeholder="☯️" />
          </label>
          <label>
            排序
            <input name="rank" type="number" defaultValue={50} />
          </label>
          <label>
            信众（百万）
            <input name="adherentsM" type="number" step="any" />
          </label>
          <label>
            朝拜朝向
            <select name="worshipFacing" defaultValue="none">
              <option value="none">无特定朝向</option>
              <option value="qibla">麦加（Qibla）</option>
              <option value="east">东方</option>
              <option value="jerusalem">耶路撒冷</option>
            </select>
          </label>
          <label>
            发布状态
            <select name="wpStatus" defaultValue="publish">
              <option value="publish">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </label>
          <label>
            朝向文案（中）
            <input name="facingLabelZh" />
          </label>
          <label>
            朝向文案（英）
            <input name="facingLabelEn" />
          </label>
          <label>
            方位角
            <input name="facingBearing" type="number" min={0} max={360} />
          </label>
          <AdminSubmitButton>创建</AdminSubmitButton>
        </form>
      </section>
    </div>
  );
}
