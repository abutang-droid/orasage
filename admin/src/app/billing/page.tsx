import { getStaffUser, loginUrl } from '@/lib/auth';
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
  return (
    <details className="billing-slot">
      <summary>
        <code>{slotKey}</code>
        <span className="muted"> · {SLOT_KEY_HINTS[slotKey] ?? '自定义槽位'}</span>
        <span className="billing-slot-summary">
          {entries.map((e) => e.sku).join(', ') || '未配置'}
        </span>
      </summary>
      <form action={saveBillingSlotAction} className="form-grid billing-slot-form">
        <input type="hidden" name="app" value={app} />
        <input type="hidden" name="key" value={slotKey} />
        {Array.from({ length: ENTRY_ROWS }, (_, i) => {
          const entry = entries[i];
          return (
            <div key={i} className="full-width billing-entry-row">
              <label>
                SKU {i + 1}{entries.length > 1 || i > 0 ? '（多行=轮换）' : ''}
                <select name={`entry_sku_${i}`} defaultValue={entry?.sku ?? ''}>
                  <option value="">— 空 —</option>
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) {p.visibility === 'app_only' ? '· 仅计费' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                覆盖价 CNY（元）
                <input
                  name={`entry_cny_${i}`}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={entry?.priceOverrideCents != null ? (entry.priceOverrideCents / 100).toFixed(2) : ''}
                  placeholder="留空=目录价"
                />
              </label>
              <label>
                覆盖价 USD
                <input
                  name={`entry_usd_${i}`}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={entry?.priceOverrideUsdCents != null ? (entry.priceOverrideUsdCents / 100).toFixed(2) : ''}
                  placeholder="留空=目录价"
                />
              </label>
            </div>
          );
        })}
        <AdminSubmitButton size="sm">保存槽位</AdminSubmitButton>
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
  const admin = await getStaffUser(['admin']);
  if (!admin) redirect(loginUrl());
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
          紫微/八字/塔罗付费与推荐统一走计费槽位：App 传 <code>app + key</code>，返回后台配置的商品（前台商城目录不展示 <code>app_only</code> 商品）。同一槽位多行 SKU = 按 seed 轮换。
        </p>
      </header>

      {sp.saved === 'ok' ? (
        <p className="muted panel-notice">槽位已保存。</p>
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
            SKU
            <select name="entry_sku_0" required defaultValue="">
              <option value="">— 选择商品 —</option>
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
