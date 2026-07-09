import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { ENV } from './env';
import {
  ALL_STAFF_ROLES,
  isStaffRole,
  SHOP_OPS_ROLES,
  type StaffRole,
} from '../../../shared/staff-roles/index';

export type { StaffRole };

export interface StaffUser {
  id: number;
  role: StaffRole;
}

/** @deprecated 使用 StaffUser */
export type AdminUser = StaffUser;

const secret = new TextEncoder().encode(ENV.jwtSecret);

async function readStaffFromCookie(): Promise<StaffUser | null> {
  const jar = await cookies();
  const token = jar.get(ENV.jwtCookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    const sub = payload.sub;
    const role = payload.role as string | undefined;
    if (typeof sub !== 'string' || !isStaffRole(role)) return null;
    const id = Number(sub);
    if (!Number.isFinite(id)) return null;
    return { id, role };
  } catch {
    return null;
  }
}

/** 校验运营员工角色；admin 始终放行 */
export async function getStaffUser(allowed: readonly StaffRole[] = ALL_STAFF_ROLES): Promise<StaffUser | null> {
  const user = await readStaffFromCookie();
  if (!user) return null;
  if (user.role === 'admin') return user;
  if (!allowed.includes(user.role)) return null;
  return user;
}

/** 任意运营员工可访问后台 shell */
export async function getAdminUser(): Promise<StaffUser | null> {
  return getStaffUser(ALL_STAFF_ROLES);
}

/** 商城运营页面（商品/订单/促销等） */
export async function getShopStaff(): Promise<StaffUser | null> {
  return getStaffUser(SHOP_OPS_ROLES);
}

export function loginUrl() {
  return `${ENV.authUrl}/login?redirect=${encodeURIComponent(ENV.adminUrl)}`;
}

/** 读取当前员工 JWT，用于服务端代理 CMS 写接口 */
export async function getAdminToken(): Promise<string | null> {
  const user = await readStaffFromCookie();
  if (!user) return null;
  const jar = await cookies();
  return jar.get(ENV.jwtCookieName)?.value ?? null;
}

/** @deprecated 使用 getStaffUser；保留给需任意 staff 的场景 */
export async function requireStaffToken(): Promise<string> {
  const token = await getAdminToken();
  if (!token) throw new Error('未登录或无权限');
  return token;
}
