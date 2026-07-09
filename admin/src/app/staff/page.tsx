import { getSuperAdmin, loginUrl } from '@/lib/auth';
import { getStaffUsers } from '@/lib/api';
import { redirect } from 'next/navigation';
import { StaffPermissionsPanel } from '@/components/StaffPermissionsPanel';

export default async function StaffPermissionsPage() {
  const admin = await getSuperAdmin();
  if (!admin) redirect(loginUrl());

  let staff: Awaited<ReturnType<typeof getStaffUsers>>['staff'] = [];
  try {
    ({ staff } = await getStaffUsers());
  } catch (err) {
    console.error('[admin/staff]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>权限管理</h1>
        <p className="muted">
          Phase D 粗粒度角色：<code>admin</code>（全部）、<code>shop_ops</code>（商城）、<code>content_ops</code>（CMS）。
          细粒度权限点与子账号体系见 backlog 7a。
        </p>
      </header>

      <StaffPermissionsPanel staff={staff} currentUserId={admin.id} />
    </div>
  );
}
