import { getShopStaff, loginUrl } from '@/lib/auth';
import { getTags, type AdminTag, type AdminTagGroup } from '@/lib/api';
import { saveTagAction, saveTagGroupAction } from '@/app/actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import { redirect } from 'next/navigation';

const LOCALES = [
  { code: 'zh-CN', label: '简体' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
] as const;

function I18nInputs({ prefix, value }: { prefix: string; value?: Record<string, string> | null }) {
  return (
    <>
      {LOCALES.map((loc) => (
        <label key={loc.code}>
          名称 · {loc.label}
          <input
            name={`${prefix}_${loc.code}`}
            defaultValue={value?.[loc.code] ?? ''}
            required={loc.code === 'zh-CN'}
            placeholder={loc.code}
          />
        </label>
      ))}
    </>
  );
}

export default async function ShopTagsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const admin = await getShopStaff();
  if (!admin) redirect(loginUrl());
  const sp = (await searchParams) ?? {};

  let groups: AdminTagGroup[] = [];
  let tags: AdminTag[] = [];
  try {
    ({ groups, tags } = await getTags());
  } catch (err) {
    console.error('[admin/shop/tags]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商品标签</h1>
        <p className="muted">
          标签全站多语言；商品编辑页「标签」区可勾选。前台目录按标签筛选，推荐可按标签匹配。
        </p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}

      {groups.map((group) => {
        const groupTags = tags.filter((t) => t.groupId === group.id);
        return (
          <section key={group.id} className="panel">
            <h2>
              {group.labelI18n['zh-CN'] ?? group.code}（<code>{group.code}</code> · {groupTags.length} 个标签）
            </h2>
            <div className="table-wrap" style={{ marginBottom: '1rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>编码</th>
                    <th>简体</th>
                    <th>English</th>
                    <th>Português</th>
                    <th>排序</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {groupTags.map((tag) => (
                    <tr key={tag.id}>
                      <td><code>{tag.code}</code></td>
                      <td>{tag.labelI18n['zh-CN'] ?? '—'}</td>
                      <td>{tag.labelI18n.en ?? '—'}</td>
                      <td>{tag.labelI18n['pt-BR'] ?? '—'}</td>
                      <td>{tag.sortOrder}</td>
                      <td>{tag.active ? <span className="badge ok">启用</span> : <span className="badge off">停用</span>}</td>
                      <td>
                        <details>
                          <summary>编辑</summary>
                          <form action={saveTagAction} className="form-grid inline-form">
                            <input type="hidden" name="groupId" value={group.id} />
                            <input type="hidden" name="code" value={tag.code} />
                            <I18nInputs prefix="label" value={tag.labelI18n} />
                            <label>排序<input name="sortOrder" type="number" defaultValue={tag.sortOrder} /></label>
                            <label className="checkbox-label">
                              <input name="active" type="checkbox" defaultChecked={tag.active} /> 启用
                            </label>
                            <AdminSubmitButton size="sm">保存</AdminSubmitButton>
                          </form>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details>
              <summary>＋ 新增「{group.labelI18n['zh-CN'] ?? group.code}」标签</summary>
              <form action={saveTagAction} className="form-grid" style={{ marginTop: '0.75rem' }}>
                <input type="hidden" name="groupId" value={group.id} />
                <label>编码<input name="code" required placeholder="effect-wealth" /></label>
                <I18nInputs prefix="label" />
                <label>排序<input name="sortOrder" type="number" defaultValue={0} /></label>
                <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked /> 启用</label>
                <AdminSubmitButton>添加标签</AdminSubmitButton>
              </form>
            </details>
          </section>
        );
      })}

      <section className="panel">
        <h2>新增标签分组</h2>
        <form action={saveTagGroupAction} className="form-grid">
          <label>编码<input name="code" required placeholder="effect" /></label>
          <I18nInputs prefix="label" />
          <label>排序<input name="sortOrder" type="number" defaultValue={0} /></label>
          <AdminSubmitButton>添加分组</AdminSubmitButton>
        </form>
      </section>
    </div>
  );
}
