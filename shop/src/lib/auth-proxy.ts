import { cookies } from 'next/headers';
import { ENV } from './env';

/** 将用户 cookie 转发到 auth-service /auth/me/* */
export async function proxyAuthMe(path: string, init?: RequestInit) {
  const jar = await cookies();
  const token = jar.get(ENV.jwtCookieName)?.value;
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Cookie', `${ENV.jwtCookieName}=${token}`);
  return fetch(`${ENV.authInternalUrl}/auth/me${path}`, { ...init, headers, cache: 'no-store' });
}
