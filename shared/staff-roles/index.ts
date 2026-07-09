/** 运营后台员工角色（auth-service users.role，JWT claim 同步） */
export const STAFF_ROLES = ['admin', 'shop_ops', 'content_ops'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ALL_STAFF_ROLES: StaffRole[] = [...STAFF_ROLES];
export const SHOP_OPS_ROLES: StaffRole[] = ['admin', 'shop_ops'];
export const CONTENT_OPS_ROLES: StaffRole[] = ['admin', 'content_ops'];
export const SUPER_ADMIN_ROLES: StaffRole[] = ['admin'];

export function isStaffRole(role: string | undefined | null): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole);
}

export function roleInSet(role: string | undefined | null, allowed: readonly StaffRole[]): boolean {
  return isStaffRole(role) && allowed.includes(role);
}

export function canAccessNav(role: StaffRole, itemRoles?: readonly StaffRole[]): boolean {
  if (role === 'admin') return true;
  if (!itemRoles || itemRoles.length === 0) return true;
  return itemRoles.includes(role);
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: '超级管理员',
  shop_ops: '商城运营',
  content_ops: '内容运营',
};
