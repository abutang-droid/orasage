import { getAdminUser, loginUrl } from '@/lib/auth';
import { getHomepageProducts, getProducts } from '@/lib/api';
import { saveHomepageProductsAction, saveProductAction } from '@/app/actions';
import { redirect } from 'next/navigation';

const CATEGORIES = [
  { value: 'crystal', label: '水晶手串' },
  { value: 'report', label: '数字报告' },
  { value: 'service', label: '能量咨询' },
] as const;

const HOMEPAGE_SLOTS = 6;

export default async function ProductsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  let homepageSkus: string[] = [];
  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/products]', err);
  }
  try {
    ({ skus: homepageSkus } = await getHomepageProducts());
  } catch (err) {
    console.error('[admin/homepage-products]', err);
  }

  const activeProducts = products.filter((p) => p.active);

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商品管理</h1>
        <p className="muted">全平台统一商品目录，shop / bazi / tarot / main 共用 SKU</p>
      </header>

      <section className="panel">
        <h2>首页展示商品（最多 {HOMEPAGE_SLOTS} 个）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          配置 orasage.com 首页商城区块展示的商品。类别标签会根据所选商品自动出现，访客可切换筛选。
        </p>
        <form action={saveHomepageProductsAction} className="form-grid">
          {Array.from({ length: HOMEPAGE_SLOTS }, (_, i) => (
            <label key={i}>
              位置 {i + 1}
              <select name={`slot_${i}`} defaultValue={homepageSkus[i] ?? ''}>
                <option value="">— 不展示 —</option>
                {activeProducts.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    [{p.categoryLabel}] {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button type="submit" className="btn-primary full-width">保存首页展示</button>
        </form>
      </section>

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
          <label>价格 CNY（元）<input name="priceYuan" type="number" step="0.01" min="0" required placeholder="128" /></label>
          <label>价格 USD（美元）<input name="priceUsd" type="number" step="0.01" min="0" required placeholder="17.99" /></label>
          <label>排序<input name="sortOrder" type="number" defaultValue={0} /></label>
          <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked /> 上架</label>
          <label className="checkbox-label"><input name="requiresShipping" type="checkbox" defaultChecked /> 需要收货地址（实体发货）</label>
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
                <th>实体</th>
                <th>价格 CNY</th>
                <th>价格 USD</th>
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
                  <td>{p.requiresShipping ? <span className="badge ok">是</span> : <span className="badge off">否</span>}</td>
                  <td>{p.priceDisplayCny ?? p.priceDisplay}</td>
                  <td>{p.priceDisplayUsd ?? '—'}</td>
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
                        <input name="priceUsd" type="number" step="0.01" defaultValue={p.priceCentsUsd ? (p.priceCentsUsd / 100).toFixed(2) : ''} placeholder="USD" required />
                        <input name="sortOrder" type="number" defaultValue={p.sortOrder} />
                        <label><input name="active" type="checkbox" defaultChecked={p.active} /> 上架</label>
                        <label><input name="requiresShipping" type="checkbox" defaultChecked={p.requiresShipping} /> 需要收货</label>
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
