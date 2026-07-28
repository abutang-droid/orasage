import Link from 'next/link';
import { getShopStaff, loginUrl } from '@/lib/auth';
import {
  getCrystalContent,
  getHomepageProducts,
  getProducts,
  getShopConfig,
  type CrystalContentMap,
} from '@/lib/api';
import { saveCrystalContentAction, saveHomepageProductsAction, saveShopLayoutAction } from '@/app/actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import { redirect } from 'next/navigation';

const HOMEPAGE_SLOTS = 6;

const CRYSTAL_ROWS: Array<{ sku: string; element: string; name: string }> = [
  { sku: 'crystal-wood', element: '木', name: '绿幽灵能量手串' },
  { sku: 'crystal-fire', element: '火', name: '红玛瑙能量手串' },
  { sku: 'crystal-earth', element: '土', name: '黄水晶能量手串' },
  { sku: 'crystal-metal', element: '金', name: '白水晶能量手串' },
  { sku: 'crystal-water', element: '水', name: '黑曜石能量手串' },
];

export default async function ShopStorefrontPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; save_err?: string }>;
}) {
  const admin = await getShopStaff();
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};

  let content: CrystalContentMap = {};
  let homeLayout: 'legacy' | 'crystal_v1' = 'legacy';
  let homepageSkus: string[] = [];
  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];

  try {
    ({ content } = await getCrystalContent());
  } catch (err) {
    console.error('[admin/storefront/crystal]', err);
  }
  try {
    ({ homeLayout } = await getShopConfig());
  } catch (err) {
    console.error('[admin/storefront/config]', err);
  }
  try {
    ({ skus: homepageSkus } = await getHomepageProducts());
  } catch (err) {
    console.error('[admin/storefront/homepage]', err);
  }
  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/storefront/products]', err);
  }

  const publicProducts = products.filter((p) => p.active && p.visibility === 'public');

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>店铺展示</h1>
        <p className="muted">
          商城 storefront（Config Pack：<code>shop.storefront</code>）：首页布局、经典目录精选位、水晶专题文案。
          商品交易字段在 <Link href="/shop/products">商品</Link>；商城 Hero 视觉在{' '}
          <Link href="/content/heroes?app=shop">内容 · Hero</Link>。
        </p>
      </header>

      {sp.saved ? (
        <p className="muted panel-notice">已保存，前台约 30 秒内生效。</p>
      ) : null}
      {sp.save_err ? (
        <p className="muted panel-notice panel-notice--error">
          保存失败：{decodeURIComponent(sp.save_err)}
        </p>
      ) : null}

      <section className="panel">
        <h2>首页布局</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          {homeLayout === 'crystal_v1'
            ? '当前线上为「水晶专题」布局。'
            : '当前线上为「经典目录」布局。'}
        </p>
        <form action={saveShopLayoutAction} className="form-grid">
          <label className="full-width">
            切换布局
            <select name="homeLayout" defaultValue={homeLayout}>
              <option value="legacy">经典目录（全品类）</option>
              <option value="crystal_v1">水晶专题（五行主编排）</option>
            </select>
          </label>
          <AdminSubmitButton className="full-width">保存布局</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2>经典目录 · 首页精选（最多 {HOMEPAGE_SLOTS} 个）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          仅<strong>经典目录</strong>布局生效。
        </p>
        <form action={saveHomepageProductsAction} className="form-grid">
          {Array.from({ length: HOMEPAGE_SLOTS }, (_, i) => (
            <label key={i}>
              位置 {i + 1}
              <select name={`slot_${i}`} defaultValue={homepageSkus[i] ?? ''}>
                <option value="">— 不展示 —</option>
                {publicProducts.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    [{p.categoryLabel}] {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </label>
          ))}
          <AdminSubmitButton className="full-width">保存首页精选</AdminSubmitButton>
        </form>
      </section>

      <form action={saveCrystalContentAction}>
        <header className="page-header" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>水晶专题素材</h2>
          <p className="muted">留空字段回退内置占位文案（补充说明除外）。</p>
        </header>
        {CRYSTAL_ROWS.map(({ sku, element, name }) => {
          const entry = content[sku];
          return (
            <section key={sku} className="panel">
              <h2>
                {element} · {name}
                <span className="muted" style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: '0.5rem' }}>
                  {sku}
                </span>
              </h2>
              <div className="form-grid">
                <label>
                  情感短语（主标题）
                  <input
                    name={`${sku}_tagline`}
                    defaultValue={entry?.tagline ?? ''}
                    maxLength={50}
                    placeholder="如：生长之境"
                  />
                </label>
                <label>
                  能量关键词（逗号分隔，最多 8 个）
                  <input
                    name={`${sku}_keywords`}
                    defaultValue={entry?.keywords?.join('，') ?? ''}
                    placeholder="如：招财，事业，生机"
                  />
                </label>
                <label className="full-width">
                  能量故事（1–2 段）
                  <textarea
                    name={`${sku}_story`}
                    defaultValue={entry?.story ?? ''}
                    rows={4}
                    maxLength={2000}
                  />
                </label>
                <label className="full-width">
                  佩戴收益（每行一条，最多 6 条）
                  <textarea
                    name={`${sku}_benefits`}
                    defaultValue={entry?.benefits?.join('\n') ?? ''}
                    rows={3}
                    maxLength={1200}
                  />
                </label>
                <label className="full-width">
                  佩戴仪式
                  <textarea
                    name={`${sku}_ritual`}
                    defaultValue={entry?.ritual ?? ''}
                    rows={2}
                    maxLength={500}
                  />
                </label>
                <label className="full-width">
                  规格切换下方补充说明（选填）
                  <input
                    name={`${sku}_packNote`}
                    defaultValue={entry?.packNote ?? ''}
                    maxLength={200}
                  />
                </label>
              </div>
            </section>
          );
        })}
        <section className="panel">
          <AdminSubmitButton className="full-width">保存水晶专题素材</AdminSubmitButton>
        </section>
      </form>
    </div>
  );
}
