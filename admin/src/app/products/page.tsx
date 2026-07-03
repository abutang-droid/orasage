import { getAdminUser, loginUrl } from '@/lib/auth';
import { getProducts } from '@/lib/api';
import { saveProductAction } from '@/app/actions';
import { redirect } from 'next/navigation';

const CATEGORIES = [
  { value: 'crystal', label: '水晶手串' },
  { value: 'report', label: '数字报告' },
  { value: 'service', label: '能量咨询' },
] as const;

export default async function ProductsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/products]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商品管理</h1>
        <p className="muted">全平台统一商品目录，shop / bazi / tarot / main 共用 SKU</p>
      </header>

      <section className="panel">
        <h2>新增商品</h2>
        <form action={saveProductAction} className="form-grid">
          <input type="hidden" name="isEdit" value="0" />
          <label>SKU<input name="sku" required placeholder="crystal-wood" /></label>
          <label>名称<input name="name" required placeholder="绿幽灵手串" /></label>
          <label>五行<input name="element" placeholder="木（水晶类填写）" /></label>
          <label>分类
            <select name="category" defaultValue="crystal">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label>价格（元）<input name="priceYuan" type="number" step="0.01" min="0" required placeholder="128" /></label>
          <label>排序<input name="sortOrder" type="number" defaultValue={0} /></label>
          <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked /> 上架</label>
          <label className="full-width">描述<textarea name="description" rows={2} required placeholder="招财旺运 · 五行补木" /></label>
          <button type="submit" className="btn-primary">添加商品</button>
        </form>
      </section>

      <section className="panel">
        <h2>商品列表（{products.length}）</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>名称</th>
                <th>五行</th>
                <th>分类</th>
                <th>价格</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.sku}>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
                  <td>{p.element ?? '—'}</td>
                  <td>{p.categoryLabel}</td>
                  <td>{p.priceDisplay}</td>
                  <td>{p.active ? <span className="badge ok">上架</span> : <span className="badge off">下架</span>}</td>
                  <td>
                    <details>
                      <summary>编辑</summary>
                      <form action={saveProductAction} className="inline-form">
                        <input type="hidden" name="isEdit" value="1" />
                        <input type="hidden" name="sku" value={p.sku} />
                        <input name="name" defaultValue={p.name} required />
                        <input name="element" defaultValue={p.element ?? ''} placeholder="五行" />
                        <select name="category" defaultValue={p.category}>
                          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <input name="priceYuan" type="number" step="0.01" defaultValue={(p.priceCents / 100).toFixed(2)} required />
                        <input name="sortOrder" type="number" defaultValue={p.sortOrder} />
                        <label><input name="active" type="checkbox" defaultChecked={p.active} /> 上架</label>
                        <textarea name="description" rows={2} defaultValue={p.desc} required />
                        <button type="submit" className="btn-small">保存</button>
                      </form>
                    </details>
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
