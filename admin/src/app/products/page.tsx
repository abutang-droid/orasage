import { getAdminUser, loginUrl } from '@/lib/auth';
import { getHomepageProducts, getProducts, getBaziRecommendProducts } from '@/lib/api';
import { saveHomepageProductsAction, saveProductAction, saveBaziRecommendProductsAction } from '@/app/actions';
import { redirect } from 'next/navigation';

const CATEGORIES = [
  { value: 'crystal', label: '水晶手串' },
  { value: 'report', label: '数字报告' },
  { value: 'service', label: '能量咨询' },
] as const;

const HOMEPAGE_SLOTS = 6;

const BAZI_BILLING_SKUS = [
  'report-bazi-basic',
  'report-bazi-advanced',
  'report-bazi-premium',
  'report-bazi-couple-basic',
  'report-bazi-couple-advanced',
  'report-bazi-couple-premium',
] as const;

export default async function ProductsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  let homepageSkus: string[] = [];
  let baziRecommendSkus: Record<string, string> = {};
  let baziRecommendPrices: Record<string, { priceCents: number | null; priceCentsUsd: number | null }> = {};
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
  try {
    ({ skuMap: baziRecommendSkus, priceOverrides: baziRecommendPrices } = await getBaziRecommendProducts());
  } catch (err) {
    console.error('[admin/bazi-recommend-products]', err);
  }

  const activeProducts = products.filter((p) => p.active);
  const baziBillingProducts = BAZI_BILLING_SKUS
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商品管理</h1>
        <p className="muted">全平台统一商品目录，shop / bazi / tarot / main 共用 SKU</p>
      </header>

      <section className="panel">
        <h2>八字计费商品（6 个固定 SKU）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          八字单人/合盘三档报告的价格、描述与发货配置。修改后 bazi 付费墙与 shop 结账页同步生效。
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>名称</th>
                <th>实体</th>
                <th>价格 CNY</th>
                <th>价格 USD</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {baziBillingProducts.map((p) => (
                <tr key={p.sku}>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
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
        {baziBillingProducts.length < BAZI_BILLING_SKUS.length ? (
          <p className="muted" style={{ marginTop: '1rem' }}>
            部分合盘 SKU 尚未入库，请执行 auth-service 迁移 0012 或在下方通用商品区手动添加。
          </p>
        ) : null}
      </section>

      <section className="panel">
        <h2>八字报告商品推荐（五行 → SKU）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          仅对购买<strong>基础版数字报告</strong>的用户展示推荐商品。进阶版/礼盒版已含实体商品，不再额外推荐。
          推荐价可独立于商城目录价设置（留空则使用商城价格）。
        </p>
        <form action={saveBaziRecommendProductsAction} className="form-grid">
          {(['木', '火', '土', '金', '水'] as const).map((element) => {
            const catalog = activeProducts.find((p) => p.sku === (baziRecommendSkus[element] ?? ''));
            const priceOverride = baziRecommendPrices[element];
            const defaultCny = priceOverride?.priceCents != null
              ? (priceOverride.priceCents / 100).toFixed(2)
              : '';
            const defaultUsd = priceOverride?.priceCentsUsd != null
              ? (priceOverride.priceCentsUsd / 100).toFixed(2)
              : '';
            return (
              <div key={element} className="full-width" style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', alignItems: 'end' }}>
                <label>
                  五行「{element}」推荐商品
                  <select name={`bazi_rec_${element}`} defaultValue={baziRecommendSkus[element] ?? ''}>
                    <option value="">— 默认 crystal-{element === '木' ? 'wood' : element === '火' ? 'fire' : element === '土' ? 'earth' : element === '金' ? 'metal' : 'water'} —</option>
                    {activeProducts.filter((p) => p.category === 'crystal').map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.name} ({p.sku}) · 商城 {p.priceDisplayCny ?? p.priceDisplay}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  推荐价 CNY（元）
                  <input
                    name={`bazi_rec_price_cny_${element}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={catalog ? `商城 ${(catalog.priceCents / 100).toFixed(2)}` : '留空=商城价'}
                    defaultValue={defaultCny}
                  />
                </label>
                <label>
                  推荐价 USD
                  <input
                    name={`bazi_rec_price_usd_${element}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={catalog?.priceCentsUsd ? `商城 ${(catalog.priceCentsUsd / 100).toFixed(2)}` : '留空=商城价'}
                    defaultValue={defaultUsd}
                  />
                </label>
              </div>
            );
          })}
          <button type="submit" className="btn-primary full-width">保存八字推荐配置</button>
        </form>
      </section>

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
