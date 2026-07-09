import { getStaffManager, loginUrl } from '@/lib/auth';
import { listStaffAccounts, getStaffMeta } from '@/lib/api';
import { createStaffAction, updateStaffAction } from '@/app/staff-actions';
import { redirect } from 'next/navigation';
import { AdminSubmitButton } from '@/components/AdminButton';

export default async function StaffPage() {
  const manager = await getStaffManager();
  if (!manager) redirect(loginUrl());

  let staff: Awaited<ReturnType<typeof listStaffAccounts>>['staff'] = [];
  let meta: Awaited<ReturnType<typeof getStaffMeta>> | null = null;
  try {
    [{ staff }, meta] = await Promise.all([listStaffAccounts(), getStaffMeta()]);
  } catch (err) {
    console.error('[admin/staff]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>子账号管理</h1>
        <p className="muted">
          创建商城运营 / 内容运营子账号；可额外授予计费槽位或子账号管理权限。权限变更后需重新登录生效。
        </p>
      </header>

      <section className="panel" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>新建子账号</h2>
        <form action={createStaffAction} className="inline-status-form" style={{ display: 'grid', gap: '0.5rem', maxWidth: '28rem' }}>
          <input type="email" name="email" placeholder="邮箱" required className="shipment-input" />
          <input type="password" name="password" placeholder="初始密码（≥8 位）" required minLength={8} className="shipment-input" />
          <input type="text" name="nickname" placeholder="显示名（可选）" className="shipment-input" />
          <input type="text" name="staffLabel" placeholder="备注，如「巴西站运营」" className="shipment-input" />
          <select name="role" defaultValue="shop_ops" className="shipment-input">
            {meta?.roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {meta?.assignableExtras.map((p) => (
            <label key={p.value} className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <input type="checkbox" name="extraGrant" value={p.value} />
              额外授予：{p.label}
            </label>
          ))}
          <AdminSubmitButton>创建</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>运营账号列表</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>邮箱 / 备注</th>
                <th>角色</th>
                <th>状态</th>
                <th>有效权限</th>
                <th>管理</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr><td colSpan={6} className="muted">暂无子账号</td></tr>
              ) : staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>
                    <code>{s.email}</code>
                    {s.staffLabel ? <div className="muted">{s.staffLabel}</div> : null}
                  </td>
                  <td>{s.roleLabel}</td>
                  <td>{s.staffDisabled ? <span className="badge">已停用</span> : <span className="badge">正常</span>}</td>
                  <td className="muted" style={{ maxWidth: '16rem', fontSize: '0.8rem' }}>
                    {s.permissions.slice(0, 6).join(' · ')}
                    {s.permissions.length > 6 ? ` …+${s.permissions.length - 6}` : ''}
                  </td>
                  <td>
                    {s.role === 'admin' ? (
                      <span className="muted">超级管理员</span>
                    ) : (
                      <form action={updateStaffAction} style={{ display: 'grid', gap: '0.35rem', minWidth: '14rem' }}>
                        <input type="hidden" name="id" value={s.id} />
                        <select name="role" defaultValue={s.role} className="shipment-input">
                          {meta?.roles.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        <label className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <input type="checkbox" name="staffDisabled" value="1" defaultChecked={s.staffDisabled} />
                          停用账号
                        </label>
                        <input type="text" name="staffLabel" placeholder="备注" defaultValue={s.staffLabel ?? ''} className="shipment-input" />
                        <input type="password" name="password" placeholder="重置密码（留空不改）" className="shipment-input" />
                        {meta?.assignableExtras.map((p) => (
                          <label key={p.value} className="muted" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              name="extraGrant"
                              value={p.value}
                              defaultChecked={s.staffGrants.includes(p.value)}
                            />
                            {p.label}
                          </label>
                        ))}
                        <AdminSubmitButton size="sm">保存</AdminSubmitButton>
                      </form>
                    )}
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
