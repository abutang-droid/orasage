import { getShopStaff, loginUrl, staffCan } from '@/lib/auth';
import { getPromoChannel, getPromoChannels, type AdminPromoChannel, type AdminPromoCommissionLeg, type AdminPromoLegKind } from '@/lib/api';
import { createPromoChannelAction, settlePromoChannelAction, updatePromoChannelAction } from '@/app/actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import { redirect } from 'next/navigation';
import { PROMO_LEG_LABELS } from '../../../../../shared/promo-channel/index';

function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function LegBadge({ leg }: { leg: AdminPromoLegKind }) {
  return <span className={`promo-leg-badge promo-leg-badge--${leg}`}>{PROMO_LEG_LABELS[leg]}</span>;
}

function ChannelForm({ channel }: { channel?: AdminPromoChannel }) {
  const action = channel ? updatePromoChannelAction : createPromoChannelAction;
  return (
    <form action={action} className="form-grid">
      {channel ? <input type="hidden" name="id" value={channel.id} /> : null}
      {channel ? (
        <label>
          渠道码
          <input value={channel.code} readOnly />
        </label>
      ) : (
        <label>
          渠道码
          <input name="code" required minLength={2} maxLength={32} placeholder="WECHAT01" />
        </label>
      )}
      <label>
        渠道名称
        <input name="name" required defaultValue={channel?.name ?? ''} placeholder="微信金腿 A" />
      </label>
      <label>
        联系人
        <input name="contact" defaultValue={channel?.contact ?? ''} placeholder="姓名 / 微信 / 邮箱" />
      </label>
      <label>
        分佣比例 %
        <input
          name="commissionPercent"
          type="number"
          min="0"
          max="100"
          step="0.1"
          defaultValue={channel?.commissionPercent ?? 10}
        />
      </label>
      <label>
        分佣金腿
        <select name="leg" defaultValue={channel?.leg ?? 'gold'}>
          <option value="gold">金腿</option>
          <option value="silver">银腿</option>
          <option value="standard">普通</option>
        </select>
      </label>
      <label className="checkbox-label">
        <input name="active" type="checkbox" defaultChecked={channel?.active ?? true} /> 启用
      </label>
      <label className="full-width">
        备注
        <textarea name="notes" rows={2} defaultValue={channel?.notes ?? ''} />
      </label>
      <AdminSubmitButton size="sm">{channel ? '保存渠道' : '添加渠道'}</AdminSubmitButton>
    </form>
  );
}

function CommissionLegs({
  channel,
  legs,
}: {
  channel: AdminPromoChannel;
  legs: AdminPromoCommissionLeg[];
}) {
  const pending = legs.filter((leg) => leg.status === 'pending').length;
  return (
    <section className="panel">
      <h2>
        {channel.name} · 分佣腿（{legs.length}）
      </h2>
      <p className="muted">
        已支付订单按当时比例记一笔分佣腿；结算为线下打款后点「全部结算」。待结算 {pending} 笔 · {usd(channel.stats.pendingCents)}
      </p>
      {pending > 0 ? (
        <form action={settlePromoChannelAction} className="promo-settle-form">
          <input type="hidden" name="id" value={channel.id} />
          <AdminSubmitButton size="sm">结算全部待结佣金</AdminSubmitButton>
        </form>
      ) : null}
      {legs.length === 0 ? (
        <p className="muted">尚无归因订单。把分享链接发给渠道，用户下单支付后会出现在这里。</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>订单金额</th>
                <th>比例</th>
                <th>佣金</th>
                <th>状态</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {legs.map((leg) => (
                <tr key={leg.id}>
                  <td><code>{leg.orderNo}</code></td>
                  <td>{usd(leg.orderCents)}</td>
                  <td>{(leg.rateBps / 100).toFixed(1)}%</td>
                  <td>{usd(leg.commissionCents)}</td>
                  <td>{leg.status === 'pending' ? '待结算' : leg.status === 'settled' ? '已结算' : '已作废'}</td>
                  <td className="muted">{new Date(leg.createdAt).toLocaleString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function ShopChannelsPage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; err?: string; id?: string }>;
}) {
  const staff = await getShopStaff();
  if (!staff) redirect(loginUrl());
  if (staff.permissions.length > 0 && !staffCan(staff, 'shop.promotions')) redirect(loginUrl());
  const sp = (await searchParams) ?? {};
  const selectedId = Number(sp.id ?? 0);

  let channels: AdminPromoChannel[] = [];
  try {
    ({ channels } = await getPromoChannels());
  } catch (err) {
    console.error('[admin/shop/channels]', err);
  }

  let selected: { channel: AdminPromoChannel; legs: AdminPromoCommissionLeg[] } | null = null;
  if (selectedId > 0) {
    try {
      selected = await getPromoChannel(selectedId);
    } catch (err) {
      console.error('[admin/shop/channels detail]', err);
    }
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>推广渠道</h1>
        <p className="muted">
          为合作渠道生成带 <code>?ch=渠道码</code> 的分享链接。用户访问后写入归因 cookie，全站（门户 / 商城 / 八字 / 紫微 / 塔罗）下单支付后记一笔分佣腿，后台线下结算。金腿 / 银腿仅作渠道分类，不影响分佣计算。
        </p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? <p className="panel-error">{sp.err}</p> : null}

      <section className="panel">
        <h2>新建渠道</h2>
        <ChannelForm />
      </section>

      <section className="panel">
        <h2>渠道列表（{channels.length}）</h2>
        {channels.length === 0 ? (
          <p className="muted">还没有推广渠道。先添加一个渠道码，再把分享链接发给合作方。</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>渠道</th>
                  <th>金腿</th>
                  <th>分佣</th>
                  <th>待结 / 已结</th>
                  <th>分享链接</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((channel) => (
                  <tr key={channel.id}>
                    <td>
                      <strong>{channel.name}</strong>
                      <div><code>{channel.code}</code></div>
                      {channel.contact ? <div className="muted">{channel.contact}</div> : null}
                    </td>
                    <td><LegBadge leg={channel.leg} /></td>
                    <td>{channel.commissionPercent.toFixed(1)}%</td>
                    <td>
                      {usd(channel.stats.pendingCents)}
                      <span className="muted"> / {usd(channel.stats.settledCents)}</span>
                      <div className="muted">{channel.stats.paidOrders} 单</div>
                    </td>
                    <td>
                      <input className="promo-share-input" readOnly value={channel.shareUrl} />
                    </td>
                    <td>{channel.active ? '启用' : '停用'}</td>
                    <td>
                      <a className="btn-text" href={`/shop/channels?id=${channel.id}`}>分佣腿</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected ? (
        <>
          <section className="panel">
            <h2>编辑 {selected.channel.name}</h2>
            <ChannelForm channel={selected.channel} />
          </section>
          <CommissionLegs channel={selected.channel} legs={selected.legs} />
        </>
      ) : null}
    </div>
  );
}
