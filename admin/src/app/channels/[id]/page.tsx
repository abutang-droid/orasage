import { getChannelManager, loginUrl } from '@/lib/auth';
import { getChannel, getChannelsMeta } from '@/lib/api';
import {
  createChannelMemberAction,
  deleteChannelMemberAction,
  updateChannelAction,
  updateChannelMemberAction,
} from '@/app/channel-actions';
import { redirect, notFound } from 'next/navigation';
import { AdminSubmitButton } from '@/components/AdminButton';
import {
  CHANNEL_MEMBER_ROLE_LABELS,
  type ChannelMemberRole,
} from '../../../../../shared/sales-channels/index';

type Props = { params: Promise<{ id: string }> };

const ROLE_ORDER: ChannelMemberRole[] = ['bd', 'ops', 'designer', 'salesperson', 'store'];

export default async function ChannelDetailPage({ params }: Props) {
  const manager = await getChannelManager();
  if (!manager) redirect(loginUrl());

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let channel: Awaited<ReturnType<typeof getChannel>>['channel'] | null = null;
  let members: Awaited<ReturnType<typeof getChannel>>['members'] = [];
  let meta: Awaited<ReturnType<typeof getChannelsMeta>> | null = null;
  try {
    [{ channel, members }, meta] = await Promise.all([getChannel(id), getChannelsMeta()]);
  } catch (err) {
    console.error('[admin/channels/detail]', err);
    notFound();
  }
  if (!channel) notFound();

  const byRole = ROLE_ORDER.map((role) => ({
    role,
    label: CHANNEL_MEMBER_ROLE_LABELS[role],
    members: members.filter((m) => m.memberRole === role),
  }));

  return (
    <div className="admin-page">
      <header className="page-header">
        <p className="muted" style={{ marginBottom: '0.35rem' }}>
          <a href="/channels">← 渠道列表</a>
        </p>
        <h1>{channel.name}</h1>
        <p className="muted">
          编码 <code>{channel.code}</code> · {channel.statusLabel} · 成员 {members.length} 人
        </p>
      </header>

      <section className="panel" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>渠道信息与默认分成</h2>
        <form action={updateChannelAction} style={{ display: 'grid', gap: '0.5rem', maxWidth: '36rem' }}>
          <input type="hidden" name="id" value={channel.id} />
          <label className="muted" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
            名称
            <input type="text" name="name" required defaultValue={channel.name} className="shipment-input" />
          </label>
          <label className="muted" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
            状态
            <select name="status" defaultValue={channel.status} className="shipment-input">
              <option value="active">启用</option>
              <option value="disabled">停用</option>
            </select>
          </label>
          <label className="muted" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
            绑定主账号邮箱
            <input
              type="email"
              name="ownerEmail"
              defaultValue={channel.owner?.email ?? ''}
              placeholder="须为已注册用户"
              className="shipment-input"
            />
          </label>
          {channel.owner ? (
            <label className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <input type="checkbox" name="clearOwner" value="1" />
              清除绑定账号
            </label>
          ) : null}
          <label className="muted" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.85rem' }}>
            备注
            <input type="text" name="note" defaultValue={channel.note ?? ''} className="shipment-input" />
          </label>

          <div style={{ display: 'grid', gap: '0.35rem', marginTop: '0.25rem' }}>
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              各级默认分成（%）· 当前合计 <strong>{channel.rates.sumPercent}%</strong>
              {channel.rates.sumExceeds100 ? ' · 已超过 100%，请核对' : ''}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))', gap: '0.5rem' }}>
              {ROLE_ORDER.map((role) => {
                const percent =
                  role === 'bd' ? channel.rates.bdPercent
                    : role === 'ops' ? channel.rates.opsPercent
                      : role === 'designer' ? channel.rates.designerPercent
                        : role === 'salesperson' ? channel.rates.salespersonPercent
                          : channel.rates.storePercent;
                return (
                  <label key={role} className="muted" style={{ display: 'grid', gap: '0.2rem', fontSize: '0.8rem' }}>
                    {CHANNEL_MEMBER_ROLE_LABELS[role]}
                    <input
                      type="number"
                      name={`rate_${role}`}
                      min={0}
                      max={100}
                      step={0.01}
                      defaultValue={percent}
                      className="shipment-input"
                    />
                  </label>
                );
              })}
            </div>
          </div>
          <AdminSubmitButton>保存渠道</AdminSubmitButton>
        </form>
      </section>

      <section className="panel" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>添加成员</h2>
        <form action={createChannelMemberAction} style={{ display: 'grid', gap: '0.5rem', maxWidth: '36rem' }}>
          <input type="hidden" name="channelId" value={channel.id} />
          <select name="memberRole" defaultValue="salesperson" className="shipment-input">
            {(meta?.memberRoles ?? ROLE_ORDER.map((value) => ({ value, label: CHANNEL_MEMBER_ROLE_LABELS[value] }))).map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <input type="text" name="name" placeholder="姓名 / 店面名称" required className="shipment-input" />
          <input type="email" name="userEmail" placeholder="绑定账号邮箱（可选）" className="shipment-input" />
          <input type="number" name="commissionPercent" min={0} max={100} step={0.01} placeholder="个人分成 %（留空用渠道默认）" className="shipment-input" />
          <input type="text" name="contact" placeholder="联系方式（可选）" className="shipment-input" />
          <input type="text" name="address" placeholder="地址（店面等，可选）" className="shipment-input" />
          <input type="text" name="note" placeholder="备注（可选）" className="shipment-input" />
          <AdminSubmitButton>添加成员</AdminSubmitButton>
        </form>
      </section>

      {byRole.map(({ role, label, members: roleMembers }) => (
        <section key={role} className="panel" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
            {label}
            <span className="muted" style={{ fontWeight: 400, marginLeft: '0.5rem' }}>
              默认 {role === 'bd' ? channel.rates.bdPercent
                : role === 'ops' ? channel.rates.opsPercent
                  : role === 'designer' ? channel.rates.designerPercent
                    : role === 'salesperson' ? channel.rates.salespersonPercent
                      : channel.rates.storePercent}% · {roleMembers.length} 人
            </span>
          </h2>
          {roleMembers.length === 0 ? (
            <p className="muted">暂无{label}</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>绑定账号</th>
                    <th>分成</th>
                    <th>联系 / 地址</th>
                    <th>状态</th>
                    <th>管理</th>
                  </tr>
                </thead>
                <tbody>
                  {roleMembers.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div>{m.name}</div>
                        {m.note ? <div className="muted" style={{ fontSize: '0.8rem' }}>{m.note}</div> : null}
                      </td>
                      <td>
                        {m.user ? (
                          <>
                            <div>{m.user.nickname || m.user.email}</div>
                            <code className="muted" style={{ fontSize: '0.75rem' }}>{m.user.email}</code>
                          </>
                        ) : (
                          <span className="muted">未绑定</span>
                        )}
                      </td>
                      <td>
                        <strong>{m.effectiveCommissionLabel}</strong>
                        <div className="muted" style={{ fontSize: '0.75rem' }}>
                          {m.usesChannelDefault ? '渠道默认' : '个人覆盖'}
                        </div>
                      </td>
                      <td className="muted" style={{ fontSize: '0.8rem', maxWidth: '12rem' }}>
                        {m.contact || '—'}
                        {m.address ? <div>{m.address}</div> : null}
                      </td>
                      <td>{m.disabled ? <span className="badge">已停用</span> : <span className="badge">正常</span>}</td>
                      <td>
                        <form action={updateChannelMemberAction} style={{ display: 'grid', gap: '0.35rem', minWidth: '14rem' }}>
                          <input type="hidden" name="channelId" value={channel.id} />
                          <input type="hidden" name="memberId" value={m.id} />
                          <input type="text" name="name" defaultValue={m.name} required className="shipment-input" />
                          <select name="memberRole" defaultValue={m.memberRole} className="shipment-input">
                            {ROLE_ORDER.map((r) => (
                              <option key={r} value={r}>{CHANNEL_MEMBER_ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                          <input
                            type="email"
                            name="userEmail"
                            defaultValue={m.user?.email ?? ''}
                            placeholder="绑定邮箱"
                            className="shipment-input"
                          />
                          {m.user ? (
                            <label className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.8rem' }}>
                              <input type="checkbox" name="clearUser" value="1" />
                              清除绑定
                            </label>
                          ) : null}
                          <input
                            type="number"
                            name="commissionPercent"
                            min={0}
                            max={100}
                            step={0.01}
                            defaultValue={m.commissionPercent ?? ''}
                            placeholder="个人分成 %"
                            className="shipment-input"
                          />
                          <label className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.8rem' }}>
                            <input type="checkbox" name="useDefaultRate" value="1" defaultChecked={m.usesChannelDefault} />
                            使用渠道默认分成
                          </label>
                          <input type="text" name="contact" defaultValue={m.contact ?? ''} placeholder="联系方式" className="shipment-input" />
                          <input type="text" name="address" defaultValue={m.address ?? ''} placeholder="地址" className="shipment-input" />
                          <input type="text" name="note" defaultValue={m.note ?? ''} placeholder="备注" className="shipment-input" />
                          <label className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontSize: '0.8rem' }}>
                            <input type="checkbox" name="disabled" value="1" defaultChecked={m.disabled} />
                            停用
                          </label>
                          <AdminSubmitButton size="sm">保存</AdminSubmitButton>
                        </form>
                        <form action={deleteChannelMemberAction} style={{ marginTop: '0.35rem' }}>
                          <input type="hidden" name="channelId" value={channel.id} />
                          <input type="hidden" name="memberId" value={m.id} />
                          <AdminSubmitButton size="sm" variant="destructive">删除</AdminSubmitButton>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
