import { getShopStaff, loginUrl } from '@/lib/auth';
import { getShopConfig } from '@/lib/api';
import { saveShopPricingAction } from '@/app/actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import { redirect } from 'next/navigation';

export default async function ShopPricingPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const admin = await getShopStaff();
  if (!admin) redirect(loginUrl());
  const sp = (await searchParams) ?? {};

  let woldPerUsdt = 1;
  try {
    const cfg = await getShopConfig();
    woldPerUsdt = cfg.woldPerUsdt > 0 ? cfg.woldPerUsdt : 1;
  } catch (err) {
    console.error('[admin/shop/pricing]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商城计价</h1>
        <p className="muted">
          全站统一配置：商品只填一个价格数字（列价货币为 USDT）。前台按此处汇率换算并展示 WOLD；结账时用户可选 USDT 或 WOLD 支付。
        </p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}

      <section className="panel">
        <h2>列价货币</h2>
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          当前固定为 <strong>USDT</strong>（与 USD 1:1）。商品编辑页「价格 USDT」即为列价；WOLD 仅按下方汇率展示/支付，无需按商品再选币种。
        </p>
        <dl className="form-grid" style={{ marginBottom: 0 }}>
          <div>
            <dt className="muted">列价货币</dt>
            <dd><code>USDT</code></dd>
          </div>
          <div>
            <dt className="muted">支付可选</dt>
            <dd>USDT · WOLD</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>USDT ↔ WOLD 汇率</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          全站共用一处汇率。修改后前台展示与 WOLD 支付金额立即按新汇率计算。
        </p>
        <form action={saveShopPricingAction} className="form-grid">
          <label className="full-width">
            1 USDT = ? WOLD
            <input
              name="woldPerUsdt"
              type="number"
              step="0.0001"
              min="0.0001"
              required
              defaultValue={woldPerUsdt}
            />
          </label>
          <AdminSubmitButton className="full-width">保存汇率</AdminSubmitButton>
        </form>
      </section>
    </div>
  );
}
