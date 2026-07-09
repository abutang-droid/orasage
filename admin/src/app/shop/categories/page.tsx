import { getShopStaff, loginUrl } from '@/lib/auth';
import { getCategories, type AdminCategory } from '@/lib/api';
import { saveCategoryAction } from '@/app/actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import { redirect } from 'next/navigation';

const LOCALES = [
  { code: 'zh-CN', label: '简体' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
] as const;

function CategoryForm({ category }: { category?: AdminCategory }) {
  return (
    <form action={saveCategoryAction} className="form-grid">
      {category ? (
        <input type="hidden" name="code" value={category.code} />
      ) : (
        <label>编码<input name="code" required placeholder="accessory" /></label>
      )}
      {LOCALES.map((loc) => (
        <label key={loc.code}>
          名称 · {loc.label}
          <input
            name={`label_${loc.code}`}
            defaultValue={category?.labelI18n[loc.code] ?? ''}
            required={loc.code === 'zh-CN'}
            placeholder={loc.code}
          />
        </label>
      ))}
      <label>排序<input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} /></label>
      <label className="checkbox-label">
        <input name="active" type="checkbox" defaultChecked={category?.active ?? true} /> 启用
      </label>
      <AdminSubmitButton size="sm">{category ? '保存' : '添加分类'}</AdminSubmitButton>
    </form>
  );
}

export default async function ShopCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const admin = await getShopStaff();
  if (!admin) redirect(loginUrl());
  const sp = (await searchParams) ?? {};

  let categories: AdminCategory[] = [];
  try {
    ({ categories } = await getCategories());
  } catch (err) {
    console.error('[admin/shop/categories]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商品分类</h1>
        <p className="muted">前台目录展示分组，多语言可配置。停用分类不影响已有商品，仅前台不再显示该分组入口。</p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}

      <section className="panel">
        <h2>分类列表（{categories.length}）</h2>
        <div className="table-wrap">
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
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td><code>{cat.code}</code></td>
                  <td>{cat.labelI18n['zh-CN'] ?? '—'}</td>
                  <td>{cat.labelI18n.en ?? '—'}</td>
                  <td>{cat.labelI18n['pt-BR'] ?? '—'}</td>
                  <td>{cat.sortOrder}</td>
                  <td>{cat.active ? <span className="badge ok">启用</span> : <span className="badge off">停用</span>}</td>
                  <td>
                    <details>
                      <summary>编辑</summary>
                      <CategoryForm category={cat} />
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>新增分类</h2>
        <CategoryForm />
      </section>
    </div>
  );
}
