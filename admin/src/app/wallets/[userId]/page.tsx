import { getStaffUser, loginUrl } from '@/lib/auth';
import { getAdminWalletLedger, getAdminWalletUser } from '@/lib/api';
import { adjustWalletAction } from '@/app/wallet-actions';
import { redirect, notFound } from 'next/navigation';
import { AdminSubmitButton } from '@/components/AdminButton';

type Props = { params: Promise<{ userId: string }> };

const CURRENCIES = ['CNY', 'USD', 'BRL'] as const;

export default async function WalletDetailPage({ params }: Props) {
  const admin = await getStaffUser(['admin']);
  if (!admin) redirect(loginUrl());

  const { userId: userIdRaw } = await params;
  const userId = Number(userIdRaw);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  let summary: Awaited<ReturnType<typeof getAdminWalletUser>> | null = null;
  let entries: Awaited<ReturnType<typeof getAdminWalletLedger>>['entries'] = [];
  try {
    [summary, { entries }] = await Promise.all([
      getAdminWalletUser(userId),
      getAdminWalletLedger(userId, 100),
    ]);
  } catch (err) {
    console.error('[admin/wallets/detail]', err);
    notFound();
  }

  if (!summary) notFound();

  return (
    <div className="admin-page">
      <header className="page-header">
        <p className="muted"><a href="/wallets">← 用户钱包</a></p>
        <h1>{summary.user.nickname || summary.user.email}</h1>
        <p className="muted">
          <code>{summary.user.email}</code>
          {summary.user.displayId ? ` · ${summary.user.displayId}` : ''}
          {' · '}用户 #{summary.user.id}
        </p>
      </header>

      <section className="panel" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>余额</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {summary.wallets.map((w) => (
            <li key={w.id}>
              <strong>{w.currency}</strong>：{w.balanceDisplay}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>人工调整</h2>
        <form action={adjustWalletAction} className="inline-status-form" style={{ display: 'grid', gap: '0.5rem', maxWidth: '24rem' }}>
          <input type="hidden" name="userId" value={userId} />
          <label className="muted">
            币种
            <select name="currency" defaultValue="CNY" className="shipment-input">
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="muted">
            调整金额（元，正数入账、负数扣减）
            <input type="number" name="amountYuan" step="0.01" required className="shipment-input" placeholder="例如 10 或 -5" />
          </label>
          <input type="text" name="note" placeholder="备注（可选）" className="shipment-input" />
          <AdminSubmitButton>提交调整</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>流水</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>类型</th>
                <th>金额</th>
                <th>余额后</th>
                <th>关联</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="muted">暂无流水</td></tr>
              ) : entries.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.createdAt).toLocaleString('zh-CN')}</td>
                  <td>{e.kindLabel}</td>
                  <td style={{ color: e.amountCents >= 0 ? 'var(--success, #0a0)' : undefined }}>{e.amountDisplay}</td>
                  <td>{e.balanceAfterDisplay}</td>
                  <td className="muted">
                    {e.referenceType ? `${e.referenceType}${e.referenceId ? `:${e.referenceId}` : ''}` : '—'}
                  </td>
                  <td className="muted">{e.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
