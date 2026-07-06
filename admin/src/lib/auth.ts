import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { ENV } from './env';

export interface AdminUser {
  id: number;
  role: 'user' | 'admin';
}

const secret = new TextEncoder().encode(ENV.jwtSecret);

/** 校验登录态并要求 role === 'admin'，否则返回 null（普通用户不能访问后台）。 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  const token = jar.get(ENV.jwtCookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    const sub = payload.sub;
    const role = payload.role as AdminUser['role'] | undefined;
    if (typeof sub !== 'string' || role !== 'admin') return null;
    const id = Number(sub);
    if (!Number.isFinite(id)) return null;
    return { id, role };
  } catch {
    return null;
  }
}

export function loginUrl() {
  return `${ENV.authUrl}/login?redirect=${encodeURIComponent(ENV.adminUrl)}`;
}

/** 读取当前管理员 JWT，用于服务端代理 CMS 写接口 */
export async function getAdminToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ENV.jwtCookieName)?.value ?? null;
}
