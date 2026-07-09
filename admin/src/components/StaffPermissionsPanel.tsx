'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminStaffRole, AdminStaffUser } from '@/lib/api';
import { promoteStaffUserAction, updateStaffRoleAction } from '@/app/actions';
import { STAFF_ROLE_LABELS } from '../../../shared/staff-roles/index';

const ASSIGNABLE_ROLES: AdminStaffRole[] = ['admin', 'shop_ops', 'content_ops', 'user'];

const ROLE_DESCRIPTIONS: Record<AdminStaffRole, string> = {
  admin: '全部菜单：商城、计费槽位、CMS、权限管理',
  shop_ops: '商城组：商品、订单、促销、评价；无计费与 CMS',
  content_ops: '内容组：CMS 页面与 Hero；无商城 CRUD',
  user: '普通用户，无法进入后台',
};

type Props = {
  staff: AdminStaffUser[];
  currentUserId: number;
};

export function StaffPermissionsPanel({ staff, currentUserId }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoteRole, setPromoteRole] = useState<AdminStaffRole>('shop_ops');
  const [promotePending, setPromotePending] = useState(false);

  const onSaveRole = async (userId: number, role: AdminStaffRole) => {
    setPendingId(userId);
    setError(null);
    try {
      await updateStaffRoleAction(userId, role);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setPendingId(null);
    }
  };

  const onPromote = async () => {
    setPromotePending(true);
    setError(null);
    try {
      await promoteStaffUserAction(promoteEmail, promoteRole);
      setPromoteEmail('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '授权失败');
    } finally {
      setPromotePending(false);
    }
  };

  return (
    <div className="staff-permissions">
      {error ? <p className="panel-notice panel-notice--error">{error}</p> : null}

      <section className="panel">
        <h2>添加 / 变更运营账号</h2>
        <p className="muted">
          输入已在 auth.orasage.com 注册过的邮箱，赋予运营角色。变更后对方需<strong>重新登录</strong>后 JWT 才会生效。
        </p>
        <div className="staff-promote-row">
          <label>
            邮箱
            <input
              type="email"
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </label>
          <label>
            角色
            <select value={promoteRole} onChange={(e) => setPromoteRole(e.target.value as AdminStaffRole)}>
              {ASSIGNABLE_ROLES.filter((r) => r !== 'user').map((role) => (
                <option key={role} value={role}>
                  {STAFF_ROLE_LABELS[role as keyof typeof STAFF_ROLE_LABELS]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-secondary"
            disabled={promotePending || !promoteEmail.trim()}
            onClick={() => void onPromote()}
          >
            {promotePending ? '处理中…' : '授权'}
          </button>
        </div>
        <p className="muted staff-role-hint">{ROLE_DESCRIPTIONS[promoteRole]}</p>
      </section>

      <section className="panel">
        <h2>当前运营账号（{staff.length}）</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>邮箱</th>
                <th>昵称</th>
                <th>角色</th>
                <th>最近登录</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    暂无运营账号。请先在上方为已有用户授权。
                  </td>
                </tr>
              ) : (
                staff.map((user) => (
                  <StaffRow
                    key={user.id}
                    user={user}
                    isSelf={user.id === currentUserId}
                    pending={pendingId === user.id}
                    onSave={onSaveRole}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>角色说明</h2>
        <ul className="staff-role-list muted">
          {(Object.keys(ROLE_DESCRIPTIONS) as AdminStaffRole[])
            .filter((r) => r !== 'user')
            .map((role) => (
              <li key={role}>
                <strong>{STAFF_ROLE_LABELS[role as keyof typeof STAFF_ROLE_LABELS]}</strong>
                {' — '}
                {ROLE_DESCRIPTIONS[role]}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

function StaffRow({
  user,
  isSelf,
  pending,
  onSave,
}: {
  user: AdminStaffUser;
  isSelf: boolean;
  pending: boolean;
  onSave: (userId: number, role: AdminStaffRole) => Promise<void>;
}) {
  const [role, setRole] = useState<AdminStaffRole>(user.role);

  return (
    <tr>
      <td>{user.email}</td>
      <td>{user.nickname || '—'}</td>
      <td>
        {isSelf ? (
          <span className="badge">{STAFF_ROLE_LABELS[user.role as keyof typeof STAFF_ROLE_LABELS]}</span>
        ) : (
          <select value={role} onChange={(e) => setRole(e.target.value as AdminStaffRole)}>
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r === 'user' ? '普通用户（撤销）' : STAFF_ROLE_LABELS[r as keyof typeof STAFF_ROLE_LABELS]}
              </option>
            ))}
          </select>
        )}
      </td>
      <td>{user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleString('zh-CN') : '—'}</td>
      <td>
        {isSelf ? (
          <span className="muted">当前账号</span>
        ) : (
          <button
            type="button"
            className="btn-secondary btn-secondary--sm"
            disabled={pending || role === user.role}
            onClick={() => void onSave(user.id, role)}
          >
            {pending ? '保存中…' : '保存'}
          </button>
        )}
      </td>
    </tr>
  );
}
