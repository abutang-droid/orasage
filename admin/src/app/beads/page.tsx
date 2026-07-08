import { getAdminUser, loginUrl } from '@/lib/auth';
import { getDiyBeads, getDiyConfig, type AdminDiyBead } from '@/lib/api';
import { saveDiyBeadAction, saveDiyConfigAction } from '@/app/actions';
import { redirect } from 'next/navigation';

const BEAD_TYPES = [
  { value: 'crystal', label: '水晶主珠' },
  { value: 'spacer', label: '隔珠' },
  { value: 'disc', label: '隔片' },
] as const;

const TYPE_LABELS: Record<string, string> = {
  crystal: '水晶主珠',
  spacer: '隔珠',
  disc: '隔片',
};

function BeadForm({ bead }: { bead?: AdminDiyBead }) {
  return (
    <form action={saveDiyBeadAction} className="form-grid">
      <input type="hidden" name="isEdit" value={bead ? '1' : '0'} />
      {bead ? <input type="hidden" name="code" value={bead.code} /> : (
        <label>编码<input name="code" required placeholder="clear-8" /></label>
      )}
      <label>名称<input name="name" required defaultValue={bead?.name} placeholder="净体白水晶" /></label>
      <label>五行<input name="element" defaultValue={bead?.element ?? ''} placeholder="金" /></label>
      <label>材质<input name="material" required defaultValue={bead?.material} placeholder="白水晶" /></label>
      <label>类型
        <select name="beadType" defaultValue={bead?.type ?? 'crystal'}>
          {BEAD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>
      <label>直径 mm<input name="diameterMm" type="number" step="0.1" min="1" required defaultValue={bead?.diameterMm} /></label>
      <label>厚度 mm（隔片）<input name="thicknessMm" type="number" step="0.1" min="0.5" defaultValue={bead?.thicknessMm ?? ''} placeholder="仅隔片填写" /></label>
      <label>单颗价 CNY（元）<input name="priceYuan" type="number" step="0.01" min="0" required defaultValue={bead ? (bead.priceCents / 100).toFixed(2) : ''} /></label>
      <label>单颗价 USD<input name="priceUsd" type="number" step="0.01" min="0" defaultValue={bead?.priceCentsUsd != null ? (bead.priceCentsUsd / 100).toFixed(2) : ''} placeholder="留空按汇率折算" /></label>
      <label>库存<input name="stock" type="number" min="0" defaultValue={bead?.stock ?? 999} /></label>
      <label>排序<input name="sortOrder" type="number" defaultValue={bead?.sortOrder ?? 0} /></label>
      <label className="full-width">图片 URL<input name="imageUrl" defaultValue={bead?.imageUrl ?? ''} placeholder="留空使用渐变色占位（可粘贴 CMS 媒体库图片地址）" /></label>
      <label className="full-width">渐变色（g0,g1,g2,line）<input name="colors" defaultValue={bead?.colors ?? ''} placeholder="#ffffff,#e8e8ec,#c9c9d1,#d5d5db" /></label>
      <label className="checkbox-label"><input name="active" type="checkbox" defaultChecked={bead ? bead.active : true} /> 上架</label>
      <button type="submit" className="btn-primary">{bead ? '保存修改' : '添加珠子'}</button>
    </form>
  );
}

function BeadSwatch({ bead }: { bead: AdminDiyBead }) {
  if (bead.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={bead.imageUrl} alt={bead.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />;
  }
  const parts = (bead.colors ?? '').split(',').map((s) => s.trim());
  const bg = parts.length >= 3
    ? `radial-gradient(circle at 35% 30%, ${parts[0]} 0%, ${parts[1]} 55%, ${parts[2]} 100%)`
    : '#e5e7eb';
  return (
    <span style={{
      display: 'inline-block',
      width: 28,
      height: bead.type === 'disc' ? 10 : 28,
      borderRadius: bead.type === 'disc' ? 5 : '50%',
      background: bg,
      border: '1px solid #e5e7eb',
    }} />
  );
}

export default async function BeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ bead?: string; bead_err?: string; config?: string; config_err?: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};

  let beads: AdminDiyBead[] = [];
  let config = { lengthCorrectionMm: 3, minOrderCents: 9900, fitToleranceMm: 8, wristEaseMm: 10 };
  try {
    ({ beads } = await getDiyBeads());
  } catch (err) {
    console.error('[admin/beads]', err);
  }
  try {
    ({ config } = await getDiyConfig());
  } catch (err) {
    console.error('[admin/diy-config]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>珠子配置（共振定制）</h1>
        <p className="muted">
          DIY 手串设计器的珠子目录：水晶主珠 / 隔珠 / 隔片，每颗独立配置五行、材质、尺寸与价格。
          保存后约 1 分钟内在 shop.orasage.com/diy 生效。
        </p>
      </header>

      {sp.bead === 'ok' ? <p className="muted panel-notice">珠子已保存。</p> : null}
      {sp.bead_err ? <p className="muted panel-notice panel-notice--error">保存失败：{decodeURIComponent(sp.bead_err)}</p> : null}
      {sp.config === 'ok' ? <p className="muted panel-notice">全局配置已保存。</p> : null}
      {sp.config_err ? <p className="muted panel-notice panel-notice--error">配置保存失败：{decodeURIComponent(sp.config_err)}</p> : null}

      <section className="panel">
        <h2>全局配置</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          串长修正 = 绳结/弹力余量（与工坊实际穿制标准校准）；预估手围 = 珠长总和 + 修正值。
        </p>
        <form action={saveDiyConfigAction} className="form-grid">
          <label>串长修正 mm<input name="lengthCorrectionMm" type="number" step="0.5" min="0" defaultValue={config.lengthCorrectionMm} /></label>
          <label>最低下单金额 CNY（元）<input name="minOrderYuan" type="number" step="1" min="0" defaultValue={(config.minOrderCents / 100).toFixed(0)} /></label>
          <label>合适度容差 mm<input name="fitToleranceMm" type="number" step="0.5" min="1" defaultValue={config.fitToleranceMm} /></label>
          <label>手围松量 mm<input name="wristEaseMm" type="number" step="0.5" min="0" defaultValue={config.wristEaseMm} /></label>
          <button type="submit" className="btn-primary">保存配置</button>
        </form>
      </section>

      <section className="panel">
        <h2>新增珠子</h2>
        <BeadForm />
      </section>

      <section className="panel">
        <h2>珠子列表（{beads.length}）</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>预览</th>
                <th>编码</th>
                <th>名称</th>
                <th>类型</th>
                <th>五行</th>
                <th>材质</th>
                <th>尺寸</th>
                <th>单颗 CNY</th>
                <th>单颗 USD</th>
                <th>库存</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {beads.length === 0 ? (
                <tr><td colSpan={12} className="muted">暂无珠子，请执行 auth-service 迁移 0021 或手动添加。</td></tr>
              ) : beads.map((bead) => (
                <tr key={bead.code}>
                  <td><BeadSwatch bead={bead} /></td>
                  <td><code>{bead.code}</code></td>
                  <td>{bead.name}</td>
                  <td>{TYPE_LABELS[bead.type] ?? bead.type}</td>
                  <td>{bead.element ?? '—'}</td>
                  <td>{bead.material}</td>
                  <td>{bead.type === 'disc' && bead.thicknessMm ? `${bead.diameterMm}×${bead.thicknessMm}mm` : `${bead.diameterMm}mm`}</td>
                  <td>¥{(bead.priceCents / 100).toFixed(2)}</td>
                  <td>{bead.priceCentsUsd != null ? `$${(bead.priceCentsUsd / 100).toFixed(2)}` : '—'}</td>
                  <td>{bead.stock}</td>
                  <td>{bead.active ? <span className="badge ok">上架</span> : <span className="badge off">下架</span>}</td>
                  <td>
                    <details>
                      <summary>编辑</summary>
                      <BeadForm bead={bead} />
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
