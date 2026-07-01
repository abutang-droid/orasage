import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { ENV } from './env';

export interface AuthUser {
  id: number;
  role: 'user' | 'admin';
}

const secret = new TextEncoder().encode(ENV.jwtSecret);

export async function getAuthUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(ENV.jwtCookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    const sub = payload.sub;
    const role = payload.role as AuthUser['role'] | undefined;
    if (typeof sub !== 'string' || !role) return null;
    const id = Number(sub);
    if (!Number.isFinite(id)) return null;
    return { id, role };
  } catch {
    return null;
  }
}

export function loginUrl(redirectPath = '/') {
  const redirect = `${ENV.shopUrl}${redirectPath}`;
  return `${ENV.authUrl}/login?redirect=${encodeURIComponent(redirect)}`;
}

export function centerUrl() {
  return `${ENV.authUrl}/center`;
}
