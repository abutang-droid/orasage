import { getChannelManager, loginUrl } from '@/lib/auth';
import { listChannels } from '@/lib/api';
import { createChannelAction } from '@/app/channel-actions';
import { redirect } from 'next/navigation';
import { AdminSubmitButton } from '@/components/AdminButton';
import { CHANNEL_MEMBER_ROLE_LABELS, type ChannelMemberRole } from '../../../../shared/sales-channels/index';

export default async function ChannelsPage() {
  const manager = await getChannelManager();
  if (!manager) redirect(loginUrl());

  let channels: Awaited<ReturnType<typeof listChannels>>['channels'] = [];
  try {
    ({ channels } = await listChannels());
  } catch (err) {
    console.error('[admin/channels]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>渠道管理</h1>
        <p className="muted">
          管理销售渠道及其绑定账号；可配置 BD / 运营 / 设计师 / 业务员 / 店面各级默认分成比例，并为成员单独覆盖。
        </p>
      </header>

      <section className="panel" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>新建渠道</h2>
        <form action={createChannelAction} className="inline-status-form" style={{ display: 'grid', gap: '0.5rem', maxWidth: '36rem' }}>
          <input type="text" name="code" placeholder="渠道编码（字母数字_-）" required pattern="[a-zA-Z0-9_-]+" className="shipment-input" />
          <input type="text" name="name" placeholder="渠道名称" required className="shipment-input" />
          <input type="email" name="ownerEmail" placeholder="绑定主账号邮箱（可选，须已注册）" className="shipment-input" />
          <input type="text" name="note" placeholder="备注（可选）" className="shipment-input" />

          <div style={{ display: 'grid', gap: '0.35rem', marginTop: '0.25rem' }}>
            <div className="muted" style={{ fontSize: '0.85rem' }}>默认分成比例（%），可后续调整</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))', gap: '0.5rem' }}>
              {(Object.keys(CHANNEL_MEMBER_ROLE_LABELS) as ChannelMemberRole[]).map((role) => (
                <label key={role} className="muted" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.8rem' }}>
                  {CHANNEL_MEMBER_ROLE_LABELS[role]}
                  <input
                    type="number"
                    name={`rate_${role}`}
                    min={0}
                    max={100}
                    step={0.01}
                    defaultValue={0}
                    className="shipment-input"
                  />
                </label>
              ))}
            </div>
          </div>

          <AdminSubmitButton>创建渠道</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>渠道列表</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>编码 / 名称</th>
                <th>状态</th>
                <th>绑定账号</th>
                <th>默认分成合计</th>
                <th>成员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {channels.length === 0 ? (
                <tr><td colSpan={6} className="muted">暂无渠道</td></tr>
              ) : channels.map((ch) => (
                <tr key={ch.id}>
                  <td>
                    <code>{ch.code}</code>
                    <div>{ch.name}</div>
                    {ch.note ? <div className="muted" style={{ fontSize: '0.8rem' }}>{ch.note}</div> : null}
                  </td>
                  <td>
                    <span className="badge">{ch.statusLabel}</span>
                  </td>
                  <td>
                    {ch.owner ? (
                      <>
                        <div>{ch.owner.nickname || ch.owner.email}</div>
                        <code className="muted" style={{ fontSize: '0.8rem' }}>{ch.owner.email}</code>
                      </>
                    ) : (
                      <span className="muted">未绑定</span>
                    )}
                  </td>
                  <td>
                    <strong>{ch.rates.sumPercent}%</strong>
                    {ch.rates.sumExceeds100 ? (
                      <div className="muted" style={{ color: 'var(--admin-danger, #b00)', fontSize: '0.75rem' }}>超过 100%</div>
                    ) : null}
                    <div className="muted" style={{ fontSize: '0.75rem', maxWidth: '14rem' }}>
                      BD {ch.rates.bdPercent}% · 运营 {ch.rates.opsPercent}% · 设计 {ch.rates.designerPercent}% · 业务 {ch.rates.salespersonPercent}% · 店面 {ch.rates.storePercent}%
                    </div>
                  </td>
                  <td>{ch.memberCount}</td>
                  <td>
                    <a href={`/channels/${ch.id}`}>管理成员 / 分成</a>
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
