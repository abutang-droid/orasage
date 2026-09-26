import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { getBillingSlots, getProducts, type AdminBillingSlot, type AdminProduct } from '@/lib/api';
import { saveBillingSlotAction, deleteBillingSlotAction } from '@/app/actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import { redirect } from 'next/navigation';

const APP_LABELS: Record<string, string> = {
  bazi: '八字',
  ziwei: '紫微',
  tarot: '塔罗',
  main: '门户',
  shop: '商城',
};

const SLOT_KEY_HINTS: Record<string, string> = {
  'recommend.element.wood': '五行「木」推荐',
  'recommend.element.fire': '五行「火」推荐',
  'recommend.element.earth': '五行「土」推荐',
  'recommend.element.metal': '五行「金」推荐',
  'recommend.element.water': '五行「水」推荐',
  'report.basic': '单人报告 · 基础',
  'report.advanced': '单人报告 · 进阶',
  'report.premium': '单人报告 · 礼盒',
  'report.couple.basic': '合盘报告 · 基础',
  'report.couple.advanced': '合盘报告 · 进阶',
  'report.couple.premium': '合盘报告 · 礼盒',
  'chat.pack10': '问答加量包',
  'chat.yearly': '问答年卡',
  'recommend.chat': '对话页推荐（轮换）',
  'daily.overage': '每日运势 · 超额加抽',
  'threecard.report': '三牌阵 · 仅报告',
  'threecard.bundle': '三牌阵 · 报告+法器',
  'recommend.daily': '每日运势推荐（轮换）',
};

const ENTRY_ROWS = 6;

function productLabel(products: AdminProduct[], sku: string) {
  const p = products.find((item) => item.sku === sku);
  return p ? `${p.name}（${p.sku}）` : sku;
}

function SlotEditor({
  app,
  slotKey,
  entries,
  products,
}: {
  app: string;
  slotKey: string;
  entries: AdminBillingSlot[];
  products: AdminProduct[];
}) {
  const boundLabels = entries.map((e) => productLabel(products, e.sku));
  const slotHidden = entries.length > 0 && entries.every((e) => !e.active);
  return (
    <details className={slotHidden ? 'billing-slot billing-slot--hidden' : 'billing-slot'}>
      <summary>
        <code>{slotKey}</code>
        <span className="muted"> · {SLOT_KEY_HINTS[slotKey] ?? '自定义槽位'}</span>
        {slotHidden ? <span className="billing-slot-hidden-badge">已隐藏</span> : null}
        <span className="billing-slot-summary">
          {boundLabels.join('、') || '未绑定商品'}
        </span>
      </summary>
      <form action={saveBillingSlotAction} className="form-grid billing-slot-form">
        <input type="hidden" name="app" value={app} />
        <input type="hidden" name="key" value={slotKey} />
        <p className="muted full-width billing-slot-help">
          换 SKU 即改绑定。勾选「隐藏此位置」后，八字/紫微/塔罗不再售卖或推荐此槽位，绑定商品保留，可随时改回。
        </p>
        {Array.from({ length: ENTRY_ROWS }, (_, i) => {
          const entry = entries[i];
          return (
            <div key={i} className="full-width billing-entry-row">
              <label>
                绑定商品 {i + 1}{entries.length > 1 || i > 0 ? '（多行=轮换）' : ''}
                <select name={`entry_sku_${i}`} defaultValue={entry?.sku ?? ''}>
                  <option value="">— 不绑定 —</option>
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) {p.visibility === 'app_only' ? '· 仅计费' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                覆盖价 USD
                <input
                  name={`entry_usd_${i}`}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={
                    entry?.priceOverrideUsdCents != null
                      ? (entry.priceOverrideUsdCents / 100).toFixed(2)
                      : entry?.priceOverrideCents != null
                        ? (entry.priceOverrideCents / 100).toFixed(2)
                        : ''
                  }
                  placeholder="留空=目录价"
                />
              </label>
              <label className="checkbox-label billing-entry-hide">
                <input
                  type="checkbox"
                  name={`entry_hidden_${i}`}
                  value="1"
                  defaultChecked={entry ? !entry.active : false}
                />
                隐藏此商品
              </label>
            </div>
          );
        })}
        <label className="checkbox-label full-width billing-slot-hide">
          <input type="checkbox" name="slot_hidden" value="1" defaultChecked={slotHidden} />
          隐藏此位置（App 端不再解析、不展示购买入口）
        </label>
        <AdminSubmitButton size="sm">保存绑定</AdminSubmitButton>
      </form>
      <form action={deleteBillingSlotAction} className="billing-slot-delete">
        <input type="hidden" name="app" value={app} />
        <input type="hidden" name="key" value={slotKey} />
        <AdminSubmitButton size="sm" variant="ghost">删除整个槽位</AdminSubmitButton>
      </form>
    </details>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; err?: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin || !staffCan(admin, 'billing.slots')) redirect(loginUrl());
  const sp = (await searchParams) ?? {};

  let slots: AdminBillingSlot[] = [];
  let products: AdminProduct[] = [];
  try {
    ({ slots } = await getBillingSlots());
  } catch (err) {
    console.error('[admin/billing]', err);
  }
  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/billing products]', err);
  }

  const byApp = new Map<string, Map<string, AdminBillingSlot[]>>();
  for (const slot of slots) {
    const appMap = byApp.get(slot.appSource) ?? new Map<string, AdminBillingSlot[]>();
    byApp.set(slot.appSource, appMap);
    const list = appMap.get(slot.slotKey) ?? [];
    appMap.set(slot.slotKey, list);
    list.push(slot);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>应用计费槽位</h1>
        <p className="muted">
          每个位置可绑定商品、改绑，或隐藏（不删除）。App 传 <code>app + key</code> 取当前绑定；隐藏后前台不再售卖/推荐，已购用户仍按原 SKU 核销。同一位置多行 SKU = 按 seed 轮换。
        </p>
      </header>

      {sp.saved === 'ok' ? (
        <p className="muted panel-notice">绑定已保存。</p>
      ) : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">保存失败：{decodeURIComponent(sp.err)}</p>
      ) : null}

      {[...byApp.entries()].map(([app, appSlots]) => (
        <section key={app} className="panel">
          <h2>{APP_LABELS[app] ?? app}（{appSlots.size} 个槽位）</h2>
          {[...appSlots.entries()].map(([key, entries]) => (
            <SlotEditor key={key} app={app} slotKey={key} entries={entries} products={products} />
          ))}
        </section>
      ))}

      <section className="panel">
        <h2>新增槽位</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          约定 key 命名：<code>report.*</code> 付费档位、<code>recommend.*</code> 推荐位、<code>chat.*</code> 问答。
        </p>
        <form action={saveBillingSlotAction} className="form-grid">
          <label>
            应用
            <select name="app" defaultValue="bazi">
              {Object.entries(APP_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label} ({code})</option>
              ))}
            </select>
          </label>
          <label>
            槽位 key
            <input name="key" required placeholder="recommend.element.wood" />
          </label>
          <label>
            绑定商品
            <select name="entry_sku_0" required defaultValue="">
              <option value="">— 选择要绑定的商品 —</option>
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </label>
          <AdminSubmitButton>创建</AdminSubmitButton>
        </form>
      </section>
    </div>
  );
}
