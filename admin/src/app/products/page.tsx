import { getAdminUser, loginUrl } from '@/lib/auth';
import { getHomepageProducts, getProducts, getBaziRecommendProducts, getZiweiRecommendProducts, getTarotBillingConfig } from '@/lib/api';
import { saveHomepageProductsAction, saveProductAction, saveBaziRecommendProductsAction, saveZiweiRecommendProductsAction, saveTarotBillingConfigAction } from '@/app/actions';
import { fetchAdminProductImageMap } from '@/lib/cms-product-images';
import { fetchCmsProductPageStatusMap } from '@/lib/cms-product-pages';
import { AdminSubmitButton } from '@/components/AdminButton';
import { ProductImageCell } from '@/components/ProductImageCell';
import { ProductImageField } from '@/components/ProductImageField';
import { ProductInlineEditForm } from '@/components/ProductInlineEditForm';
import { ProductI18nFields } from '@/components/ProductI18nFields';
import { ProductCmsLinks } from '@/components/ProductCmsLinks';
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

const ZIWEI_CHAT_SKUS = [
  'ziwei-chat-pack-10',
  'ziwei-chat-yearly',
] as const;

const ZIWEI_REC_SLOTS = 6;

const TAROT_BILLING_SKUS = [
  'tarot-daily-draw',
  'report-tarot',
  'report-tarot-bundle',
] as const;

const TAROT_REC_SLOTS = 6;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    ziwei_rec?: string;
    ziwei_rec_err?: string;
    tarot_billing?: string;
    tarot_billing_err?: string;
    image_err?: string;
    sku?: string;
  }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  let homepageSkus: string[] = [];
  let baziRecommendSkus: Record<string, string> = {};
  let baziRecommendPrices: Record<string, { priceCents: number | null; priceCentsUsd: number | null }> = {};
  let ziweiRecommendSkus: string[] = [];
  let tarotBilling = {
    dailyOverageSku: 'tarot-daily-draw',
    threeCardReportSku: 'report-tarot',
    threeCardBundleSku: 'report-tarot-bundle',
    recommendSkus: [] as string[],
  };
  let productImageMap = new Map<string, string>();
  let productPageStatusMap = new Map<string, 'published' | 'draft' | 'none'>();
  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/products]', err);
  }
  try {
    productImageMap = await fetchAdminProductImageMap();
  } catch (err) {
    console.error('[admin/product-images]', err);
  }
  try {
    productPageStatusMap = await fetchCmsProductPageStatusMap();
  } catch (err) {
    console.error('[admin/product-pages]', err);
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
  try {
    ({ skus: ziweiRecommendSkus } = await getZiweiRecommendProducts());
  } catch (err) {
    console.error('[admin/ziwei-recommend-products]', err);
  }
  try {
    tarotBilling = await getTarotBillingConfig();
  } catch (err) {
    console.error('[admin/tarot-billing-config]', err);
  }

  const activeProducts = products.filter((p) => p.active);
  const baziBillingProducts = BAZI_BILLING_SKUS
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const ziweiChatProducts = ZIWEI_CHAT_SKUS
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const tarotBillingProducts = TAROT_BILLING_SKUS
    .map((sku) => products.find((p) => p.sku === sku))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商品管理</h1>
        <p className="muted">
          全平台统一商品目录，shop / bazi / tarot / main 共用 SKU。商品信息与主图在同一页面编辑，保存后约 1 分钟内在商城前台生效。
        </p>
      </header>

      {sp.image_err ? (
        <p className="muted panel-notice panel-notice--error">
          商品 {sp.sku ? <code>{sp.sku}</code> : null} 信息已保存，但主图上传失败：{decodeURIComponent(sp.image_err)}
        </p>
      ) : null}

      <section className="panel">
        <h2>主图配置概况</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          已配置主图 {productImageMap.size} / {products.length} 个 SKU。列表缩略图使用「商品主图」；详情轮播与长文案请在 CMS「商品详情页」配置。
        </p>
      </section>

      <section className="panel">
        <h2>详情页与精选评价（CMS）</h2>
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          方案 C 内容驱动：详情多图、区块文案、精选评价在 CMS 维护；价格与上下架仍在本页编辑。首期仅 zh-CN。
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          已发布详情页{' '}
          {[...productPageStatusMap.values()].filter((s) => s === 'published').length} / {products.length} ·
          草稿 {[...productPageStatusMap.values()].filter((s) => s === 'draft').length}
        </p>
      </section>

      <section className="panel">
        <h2>八字计费商品（6 个固定 SKU）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          八字单人/合盘三档报告的价格、描述与发货配置。修改后 bazi 付费墙与 shop 结账页同步生效。
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>主图</th>
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
                  <td><ProductImageCell imageUrl={productImageMap.get(p.sku)} /></td>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
                  <td>{p.requiresShipping ? <span className="badge ok">是</span> : <span className="badge off">否</span>}</td>
                  <td>{p.priceDisplayCny ?? p.priceDisplay}</td>
                  <td>{p.priceDisplayUsd ?? '—'}</td>
                  <td>{p.active ? <span className="badge ok">上架</span> : <span className="badge off">下架</span>}</td>
                  <td>
                    <details>
                      <summary>编辑</summary>
                      <ProductInlineEditForm product={p} imageUrl={productImageMap.get(p.sku)} />
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
        <h2>紫微问答商品（2 个固定 SKU）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          紫微 Orasage 对话加量包与年卡。不含报告、不需发货；支付成功后为用户账户增加问答次数或年卡权益。
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>主图</th>
                <th>SKU</th>
                <th>名称</th>
                <th>价格 CNY</th>
                <th>价格 USD</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {ziweiChatProducts.map((p) => (
                <tr key={p.sku}>
                  <td><ProductImageCell imageUrl={productImageMap.get(p.sku)} /></td>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
                  <td>{p.priceDisplayCny ?? p.priceDisplay}</td>
                  <td>{p.priceDisplayUsd ?? '—'}</td>
                  <td>{p.active ? <span className="badge ok">上架</span> : <span className="badge off">下架</span>}</td>
                  <td>
                    <details>
                      <summary>编辑</summary>
                      <ProductInlineEditForm product={p} imageUrl={productImageMap.get(p.sku)} />
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ziweiChatProducts.length < ZIWEI_CHAT_SKUS.length ? (
          <p className="muted" style={{ marginTop: '1rem' }}>
            问答 SKU 尚未入库，请执行 auth-service 迁移 0015 或在下方通用商品区手动添加。
          </p>
        ) : null}
      </section>

      <section className="panel">
        <h2>塔罗计费与推荐（V2）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          每日运势超额加抽、三牌阵两档付费 SKU，以及每日运势报告后的能量场推荐商品（可多 SKU 轮换）。
        </p>
        {sp.tarot_billing === 'ok' ? (
          <p className="muted" style={{ color: '#166534', marginBottom: '0.75rem' }}>塔罗计费配置已保存。</p>
        ) : null}
        {sp.tarot_billing_err ? (
          <p className="muted" style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>
            保存失败：{decodeURIComponent(sp.tarot_billing_err)}
          </p>
        ) : null}
        <div className="table-wrap" style={{ marginBottom: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>主图</th>
                <th>SKU</th>
                <th>名称</th>
                <th>价格 CNY</th>
                <th>实体</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {tarotBillingProducts.map((p) => (
                <tr key={p.sku}>
                  <td><ProductImageCell imageUrl={productImageMap.get(p.sku)} /></td>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
                  <td>{p.priceDisplayCny ?? p.priceDisplay}</td>
                  <td>{p.requiresShipping ? <span className="badge ok">是</span> : <span className="badge off">否</span>}</td>
                  <td>{p.active ? <span className="badge ok">上架</span> : <span className="badge off">下架</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={saveTarotBillingConfigAction} className="form-grid">
          <label>
            每日运势 · 超额加抽 SKU
            <select name="tarot_daily_overage_sku" defaultValue={tarotBilling.dailyOverageSku}>
              {activeProducts.filter((p) => p.category === 'report' || p.category === 'service').map((p) => (
                <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </label>
          <label>
            三牌阵 · 仅完整报告 SKU
            <select name="tarot_three_report_sku" defaultValue={tarotBilling.threeCardReportSku}>
              {activeProducts.filter((p) => p.category === 'report').map((p) => (
                <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </label>
          <label>
            三牌阵 · 报告+法器合并 SKU
            <select name="tarot_three_bundle_sku" defaultValue={tarotBilling.threeCardBundleSku}>
              {activeProducts.filter((p) => p.category === 'report' || p.requiresShipping).map((p) => (
                <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </label>
          {Array.from({ length: TAROT_REC_SLOTS }, (_, i) => (
            <label key={i}>
              每日运势推荐 {i + 1}
              <select name={`tarot_rec_${i}`} defaultValue={tarotBilling.recommendSkus[i] ?? ''}>
                <option value="">— 不配置 —</option>
                {activeProducts.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </label>
          ))}
          <AdminSubmitButton className="full-width">保存塔罗计费配置</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2>紫微对话页商品推荐（单卡片轮换）</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          配置多个候选 SKU，前台每次排盘按 readingId 轮换展示一个推荐卡片（用户可关闭，仅当前对话隐藏）。
        </p>
        {sp.ziwei_rec === 'ok' ? (
          <p className="muted" style={{ color: '#166534', marginBottom: '0.75rem' }}>紫微推荐配置已保存。</p>
        ) : null}
        {sp.ziwei_rec_err ? (
          <p className="muted" style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>
            保存失败：{decodeURIComponent(sp.ziwei_rec_err)}
          </p>
        ) : null}
        <form action={saveZiweiRecommendProductsAction} className="form-grid">
          {Array.from({ length: ZIWEI_REC_SLOTS }, (_, i) => (
            <label key={i}>
              候选 {i + 1}
              <select name={`ziwei_rec_${i}`} defaultValue={ziweiRecommendSkus[i] ?? ''}>
                <option value="">— 不配置 —</option>
                {activeProducts.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </label>
          ))}
          <AdminSubmitButton>保存紫微推荐</AdminSubmitButton>
        </form>
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
          <AdminSubmitButton className="full-width">保存八字推荐配置</AdminSubmitButton>
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
          <AdminSubmitButton className="full-width">保存首页展示</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2>新增商品</h2>
        <form action={saveProductAction} className="form-grid" encType="multipart/form-data">
          <input type="hidden" name="isEdit" value="0" />
          <label className="full-width">
            <ProductImageField />
          </label>
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
          <ProductI18nFields />
          <AdminSubmitButton>添加商品</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2>商品列表（{products.length}）</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>主图</th>
                <th>SKU</th>
                <th>名称</th>
                <th>五行</th>
                <th>分类</th>
                <th>实体</th>
                <th>价格 CNY</th>
                <th>价格 USD</th>
                <th>状态</th>
                <th>详情页</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.sku}>
                  <td><ProductImageCell imageUrl={productImageMap.get(p.sku)} /></td>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
                  <td>{p.element ?? '—'}</td>
                  <td>{p.categoryLabel}</td>
                  <td>{p.requiresShipping ? <span className="badge ok">是</span> : <span className="badge off">否</span>}</td>
                  <td>{p.priceDisplayCny ?? p.priceDisplay}</td>
                  <td>{p.priceDisplayUsd ?? '—'}</td>
                  <td>{p.active ? <span className="badge ok">上架</span> : <span className="badge off">下架</span>}</td>
                  <td>
                    <ProductCmsLinks
                      sku={p.sku}
                      pageStatus={productPageStatusMap.get(p.sku) ?? 'none'}
                    />
                  </td>
                  <td>
                    <details>
                      <summary>编辑</summary>
                      <ProductInlineEditForm product={p} imageUrl={productImageMap.get(p.sku)} />
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
